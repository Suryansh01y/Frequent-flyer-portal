import DOMPurify from "dompurify";

// Treat user-entered values as plain text. No HTML is allowed in member fields.
export function sanitizeText(value, maxLength = 160) {
  if (typeof value !== "string") return "";

  const withoutMarkup = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Remove control characters without using control-character regex.
  const cleanedText = Array.from(withoutMarkup)
    .filter((char) => {
      const code = char.codePointAt(0);
      return !(code <= 31 || (code >= 127 && code <= 159));
    })
    .join("");

  return cleanedText
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function safeParseJSON(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}