import { safeParseJSON } from "./sanitize";

const STORAGE_KEY = "ffp-members-v1";

export function loadMembers(seed) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return seed;
    const parsed = safeParseJSON(raw, null);
    if (!Array.isArray(parsed)) return seed;
    return parsed.filter((item) =>
      item && typeof item.id === "string" &&
      typeof item.fullName === "string" &&
      typeof item.email === "string"
    );
  } catch (error) {
    console.warn("[Storage] Unable to read saved records; using demo data.", error);
    return seed;
  }
}

export function saveMembers(members) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    return { ok: true };
  } catch (error) {
    console.error("[Storage] Save failed. Browser storage may be unavailable or full.", error);
    return { ok: false, message: "Your browser could not save this change. Check available storage and try again." };
  }
}
