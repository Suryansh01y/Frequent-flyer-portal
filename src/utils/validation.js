import { sanitizeText } from "./sanitize";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;

export function validateMember(values) {
  const clean = {
    fullName: sanitizeText(values.fullName, 70),
    email: sanitizeText(values.email, 120).toLowerCase(),
    phone: sanitizeText(values.phone, 24),
    tier: ["Blue", "Silver", "Gold", "Platinum"].includes(values.tier) ? values.tier : "Blue",
    points: Number(values.points),
    status: ["Active", "Inactive"].includes(values.status) ? values.status : "Active"
  };

  const errors = {};
  if (clean.fullName.length < 2) errors.fullName = "Enter a name with at least 2 characters.";
  if (!EMAIL_RE.test(clean.email)) errors.email = "Enter a valid email address.";
  if (!PHONE_RE.test(clean.phone)) errors.phone = "Enter a valid phone number.";
  if (!Number.isSafeInteger(clean.points) || clean.points < 0 || clean.points > 100000000) {
    errors.points = "Points must be a whole number between 0 and 100,000,000.";
  }
  return { clean, errors };
}
