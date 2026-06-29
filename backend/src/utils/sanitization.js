import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes input value to strip any HTML tags (allowedTags: []) and trims the result if it is a string.
 * @param {any} value 
 * @returns {any} Sanitized value
 */
export const sanitizeInput = (value) => {
  if (typeof value === "string") {
    const stripped = sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    });
    return stripped.trim();
  }
  return value;
};

export default sanitizeInput;
