import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownUp, ArrowUpRight, Bell, Check, ChevronDown,
  CircleHelp, Clock3, Crown, Download, Ellipsis, Filter, LayoutDashboard,
  LoaderCircle, Menu, Plus, Search, ShieldCheck, Users, Wifi, WifiOff, X
} from "lucide-react";
import { seedMembers } from "./data/seedMembers";
import { loadMembers, saveMembers } from "./utils/storage";
import { sanitizeText } from "./utils/sanitize";
import { validateMember } from "./utils/validation";

const tierClass = (tier) => tier.toLowerCase();
const initialForm = { fullName: "", email: "", phone: "", tier: "Blue", points: "0", status: "Active" };

function App() {
  const [members, setMembers] = useState(() => loadMembers(seedMembers));
  const [activeView, setActiveView] = useState("overview");
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All tiers");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortBy, setSortBy] = useState("name");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredMembers = useMemo(() => {
    const term = sanitizeText(query, 120).toLowerCase();
    return [...members]
      .filter((member) => {
        const matchesSearch = !term || [member.id, member.fullName, member.email, member.phone]
          .some((value) => String(value).toLowerCase().includes(term));
        return matchesSearch &&
          (tierFilter === "All tiers" || member.tier === tierFilter) &&
          (statusFilter === "All statuses" || member.status === statusFilter);
      })
      .sort((a, b) => {
        if (sortBy === "points") return b.points - a.points;
        if (sortBy === "newest") return new Date(b.joinedAt) - new Date(a.joinedAt);
        return a.fullName.localeCompare(b.fullName);
      });
  }, [members, query, tierFilter, statusFilter, sortBy]);

  const activeCount = members.filter((m) => m.status === "Active").length;
  const totalPoints = members.reduce((sum, m) => sum + (Number(m.points) || 0), 0);
  const platinumCount = members.filter((m) => m.tier === "Platinum").length;

  function persist(nextMembers) {
    const result = saveMembers(nextMembers);
    if (!result.ok) {
      setToast(result.message);
      return false;
    }
    setMembers(nextMembers);
    return true;
  }

  function openCreate() {
    setSelectedMember(null);
    setForm(initialForm);
    setFormErrors({});
    setModal("form");
  }

  function openEdit(member) {
    setSelectedMember(member);
    setForm({
      fullName: member.fullName, email: member.email, phone: member.phone,
      tier: member.tier, points: String(member.points), status: member.status
    });
    setFormErrors({});
    setModal("form");
  }

  async function handleSave(event) {
    event.preventDefault();
    const { clean, errors } = validateMember(form);
    const duplicate = members.find((m) => m.email.toLowerCase() === clean.email &&
      (!selectedMember || m.id !== selectedMember.id));
    if (duplicate) errors.email = "A member with this email already exists.";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    // Simulate an asynchronous operation so loading and slow-connection states are visible.
    await new Promise((resolve) => window.setTimeout(resolve, isOnline ? 450 : 850));
    const next = selectedMember
      ? members.map((m) => m.id === selectedMember.id ? { ...m, ...clean } : m)
      : [{
          id: `FF-${Math.floor(10000 + Math.random() * 89999)}`,
          ...clean,
          joinedAt: new Date().toISOString().slice(0, 10)
        }, ...members];

    if (persist(next)) {
      console.log("[Analytics] User interacted with End-to-End Frequent Flyer Portal");
      setToast(selectedMember ? "Member details updated." : "New member added.");
      setModal(null);
    }
    setBusy(false);
  }

  function handleDelete(member) {
    const confirmed = window.confirm(`Delete member ${member.fullName} (${member.id})? This cannot be undone.`);
    if (!confirmed) return;
    const next = members.filter((m) => m.id !== member.id);
    if (persist(next)) {
      console.log("[Analytics] User interacted with End-to-End Frequent Flyer Portal");
      setToast("Member record deleted.");
      setModal(null);
    }
  }

  function exportCSV() {
    const rows = [
      ["Member ID", "Name", "Email", "Phone", "Tier", "Points", "Status", "Joined"],
      ...filteredMembers.map((m) => [m.id, m.fullName, m.email, m.phone, m.tier, m.points, m.status, m.joinedAt])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "frequent-flyer-members.csv";
    link.click();
    URL.revokeObjectURL(url);
    console.log("[Analytics] User interacted with End-to-End Frequent Flyer Portal");
    setToast("Member list exported.");
  }

  function navigate(view) {
    setActiveView(view);
    setMobileNavOpen(false);
    console.log("[Analytics] User interacted with End-to-End Frequent Flyer Portal");
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Crown size={20} /></div>
          <div><strong>SKYWARD</strong><span>FREQUENT FLYER</span></div>
          <button className="icon-button close-nav" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          <button className={`nav-link ${activeView === "overview" ? "active" : ""}`} onClick={() => navigate("overview")}><LayoutDashboard size={18} /> Overview</button>
          <button className={`nav-link ${activeView === "members" ? "active" : ""}`} onClick={() => navigate("members")}><Users size={18} /> Members <span className="nav-count">{members.length}</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Need a hand?</strong><p>Member records are stored in this browser for the demo.</p></div>
          <div className="profile"><div className="avatar">AD</div><div><strong>Admin Desk</strong><span>Portal administrator</span></div><Ellipsis size={18} className="muted-icon" /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="scrim" aria-label="Close menu overlay" onClick={() => setMobileNavOpen(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs">Workspace <span>/</span> {activeView === "overview" ? "Overview" : "Members"}</div>
          <div className="topbar-actions">
            <div className={`connection ${isOnline ? "online" : "offline"}`} role="status">
              {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
              {isOnline ? "Connected" : "Offline mode"}
            </div>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="top-avatar" aria-label="Admin profile">AD</div>
          </div>
        </header>

        {!isOnline && <div className="offline-banner" role="status"><WifiOff size={16} /> You are offline. Existing records remain available in this browser; changes are saved locally.</div>}

        <div className="page-wrap">
          {activeView === "overview" ? (
            <Overview
              members={members} activeCount={activeCount} totalPoints={totalPoints}
              platinumCount={platinumCount} onViewMembers={() => navigate("members")}
              onAdd={openCreate} onSelect={(m) => { setSelectedMember(m); setModal("details"); }}
            />
          ) : (
            <section>
              <div className="page-heading">
                <div><div className="eyebrow">MEMBER DIRECTORY</div><h1>Members</h1><p>Manage frequent flyer profiles and membership records.</p></div>
                <button className="primary-button" onClick={openCreate}><Plus size={17} /> Add member</button>
              </div>
              <div className="toolbar">
                <label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(sanitizeText(e.target.value, 120))} placeholder="Search name, email or member ID..." aria-label="Search members" /><kbd>⌘ K</kbd></label>
                <label className="select-wrap"><Filter size={16} /><select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} aria-label="Filter by tier"><option>All tiers</option><option>Blue</option><option>Silver</option><option>Gold</option><option>Platinum</option></select><ChevronDown size={15} /></label>
                <label className="select-wrap"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Active</option><option>Inactive</option></select><ChevronDown size={15} /></label>
                <label className="select-wrap"><ArrowDownUp size={16} /><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort members"><option value="name">Name A–Z</option><option value="points">Most points</option><option value="newest">Newest joined</option></select><ChevronDown size={15} /></label>
                <button className="secondary-button export-button" onClick={exportCSV}><Download size={16} /> Export</button>
              </div>
              <div className="table-card">
                <div className="table-topline"><div><strong>All members</strong><span>{filteredMembers.length} records</span></div><span className="table-note"><ShieldCheck size={14} /> Secure member directory</span></div>
                {filteredMembers.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><h3>No data found</h3><p>Try another search term or clear your filters.</p><button className="text-button" onClick={() => { setQuery(""); setTierFilter("All tiers"); setStatusFilter("All statuses"); }}>Clear filters</button></div>
                ) : (
                  <div className="table-scroll"><table><thead><tr><th>MEMBER</th><th>MEMBER ID</th><th>TIER</th><th>POINTS BALANCE</th><th>STATUS</th><th>JOINED</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>{filteredMembers.map((member) => <tr key={member.id}>
                      <td><button className="member-cell" onClick={() => { setSelectedMember(member); setModal("details"); }}><span className="member-avatar">{member.fullName.split(" ").map((n) => n[0]).slice(0,2).join("")}</span><span><strong>{member.fullName}</strong><small>{member.email}</small></span></button></td>
                      <td className="mono">{member.id}</td><td><span className={`tier-badge ${tierClass(member.tier)}`}>{member.tier}</span></td>
                      <td className="points">{Number(member.points).toLocaleString("en-IN")} <small>pts</small></td>
                      <td><span className={`status ${member.status.toLowerCase()}`}><i />{member.status}</span></td><td className="date">{formatDate(member.joinedAt)}</td>
                      <td><div className="row-actions"><button className="icon-button" aria-label={`View ${member.fullName}`} onClick={() => { setSelectedMember(member); setModal("details"); }}><ArrowUpRight size={16} /></button><button className="icon-button" aria-label={`Edit ${member.fullName}`} onClick={() => openEdit(member)}><Ellipsis size={17} /></button></div></td>
                    </tr>)}</tbody></table></div>
                )}
                <div className="table-footer">Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members <span>Demo data · Stored locally</span></div>
              </div>
            </section>
          )}
          <footer className="footer"><span>© 2026 Skyward Frequent Flyer Portal</span><span>Secure workspace <i /> All systems operational</span></footer>
        </div>
      </main>

      {modal === "form" && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setModal(null); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
          <div className="modal-header"><div><div className="eyebrow">MEMBER RECORD</div><h2 id="form-title">{selectedMember ? "Edit member" : "Add a member"}</h2><p>Enter the member information below.</p></div><button className="icon-button" aria-label="Close dialog" onClick={() => !busy && setModal(null)}><X size={19} /></button></div>
          <form onSubmit={handleSave} noValidate>
            <div className="form-grid">
              <Field label="Full name" name="fullName" value={form.fullName} error={formErrors.fullName} onChange={updateForm(setForm)} placeholder="e.g. Aditi Sharma" />
              <Field label="Email address" name="email" type="email" value={form.email} error={formErrors.email} onChange={updateForm(setForm)} placeholder="name@example.com" />
              <Field label="Phone number" name="phone" value={form.phone} error={formErrors.phone} onChange={updateForm(setForm)} placeholder="+91 98765 43210" />
              <Field label="Points balance" name="points" type="number" min="0" value={form.points} error={formErrors.points} onChange={updateForm(setForm)} placeholder="0" />
              <label className="field"><span>Membership tier</span><select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}><option>Blue</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></label>
              <label className="field"><span>Account status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
            </div>
            <div className="form-note"><ShieldCheck size={15} /> Input is validated and sanitized before it is saved.</div>
            <div className="modal-actions"><button type="button" className="secondary-button" disabled={busy} onClick={() => setModal(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={16} /> Saving...</> : <><Check size={16} /> Save member</>}</button></div>
          </form>
        </section>
      </div>}

      {modal === "details" && selectedMember && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
        <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
          <div className="modal-header"><div><div className="eyebrow">MEMBER PROFILE</div><h2 id="details-title">Member details</h2></div><button className="icon-button" aria-label="Close dialog" onClick={() => setModal(null)}><X size={19} /></button></div>
          <div className="profile-summary"><div className="profile-large">{selectedMember.fullName.split(" ").map((n) => n[0]).slice(0,2).join("")}</div><div><h3>{selectedMember.fullName}</h3><span className="mono">{selectedMember.id}</span></div><span className={`tier-badge ${tierClass(selectedMember.tier)}`}>{selectedMember.tier}</span></div>
          <div className="detail-grid"><Detail label="Email address" value={selectedMember.email} /><Detail label="Phone number" value={selectedMember.phone} /><Detail label="Points balance" value={`${Number(selectedMember.points).toLocaleString("en-IN")} pts`} /><Detail label="Account status" value={selectedMember.status} /><Detail label="Member since" value={formatDate(selectedMember.joinedAt)} /></div>
          <div className="modal-actions"><button className="danger-button" onClick={() => handleDelete(selectedMember)}>Delete member</button><button className="primary-button" onClick={() => openEdit(selectedMember)}>Edit member</button></div>
        </section>
      </div>}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={15} /></button></div>}
    </div>
  );
}

function updateForm(setForm) {
  return (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
}

function Field({ label, name, value, onChange, error, ...props }) {
  const errorId = `${name}-error`;
  return <label className={`field ${error ? "has-error" : ""}`}><span>{label}</span><input name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...props} />{error && <small id={errorId} className="field-error"><AlertCircle size={13} />{error}</small>}</label>;
}

function Detail({ label, value }) {
  return <div className="detail-item"><span>{label}</span><strong>{value}</strong></div>;
}

function Overview({ members, activeCount, totalPoints, platinumCount, onViewMembers, onAdd, onSelect }) {
  const recent = [...members].sort((a,b) => new Date(b.joinedAt) - new Date(a.joinedAt)).slice(0,5);
  return <section>
    <div className="page-heading"><div><div className="eyebrow">MONDAY, YOUR WORKSPACE</div><h1>Good evening, Admin</h1><p>Here’s what’s happening with your frequent flyer programme.</p></div><button className="primary-button" onClick={onAdd}><Plus size={17} /> Add member</button></div>
    <div className="welcome-banner"><div><div className="welcome-kicker">MEMBER OPERATIONS</div><h2>Every journey starts with a connection.</h2><p>Keep your member records organized and your loyalty programme moving.</p><button className="banner-button" onClick={onViewMembers}>Explore members <ArrowUpRight size={16} /></button></div><div className="banner-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="plane"><ArrowUpRight size={48} /></div><div className="art-dot dot-one" /><div className="art-dot dot-two" /></div></div>
    <div className="stats-grid">
      <Stat icon={<Users size={18} />} label="Total members" value={members.length.toLocaleString("en-IN")} note="Registered profiles" />
      <Stat icon={<Activity size={18} />} label="Active members" value={activeCount.toLocaleString("en-IN")} note={`${members.length ? Math.round(activeCount / members.length * 100) : 0}% of total members`} />
      <Stat icon={<Crown size={18} />} label="Platinum members" value={platinumCount.toLocaleString("en-IN")} note="Top membership tier" />
      <Stat icon={<ArrowUpRight size={18} />} label="Points in circulation" value={totalPoints.toLocaleString("en-IN")} note="Across all member accounts" />
    </div>
    <div className="section-heading"><div><h2>Recently joined</h2><p>The latest members added to your programme.</p></div><button className="text-button" onClick={onViewMembers}>View all members <ArrowUpRight size={15} /></button></div>
    <div className="recent-card">{recent.length === 0 ? <div className="empty-state"><h3>No data found</h3><p>New member records will appear here.</p></div> : recent.map((m) => <button className="recent-row" key={m.id} onClick={() => onSelect(m)}><span className="member-avatar">{m.fullName.split(" ").map((n) => n[0]).slice(0,2).join("")}</span><span className="recent-name"><strong>{m.fullName}</strong><small>{m.email}</small></span><span className={`tier-badge ${tierClass(m.tier)}`}>{m.tier}</span><span className="recent-date">{formatDate(m.joinedAt)}</span><ArrowUpRight size={16} className="muted-icon" /></button>)}</div>
    <div className="insight-strip"><div className="insight-icon"><Clock3 size={18} /></div><div><strong>Keep member information up to date</strong><p>Review profile details regularly to maintain accurate programme records.</p></div><button className="text-button" onClick={onViewMembers}>Manage directory <ArrowUpRight size={15} /></button></div>
  </section>;
}

function Stat({ icon, label, value, note }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>;
}

function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default App;
