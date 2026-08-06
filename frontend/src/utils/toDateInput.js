/**
 * Converts any Date object or ISO date-time string into the
 * "YYYY-MM-DD" format required by HTML `<input type="date">`.
 *
 * @param {Date|string|null|undefined} value
 * @returns {string}  "YYYY-MM-DD" or "" when value is falsy / invalid
 */
export const toDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};
