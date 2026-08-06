/**
 * Formats a numeric value as a USD currency string with no decimal places.
 *
 * @param {number|string} value
 * @returns {string}  e.g. "$1,234"
 */
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatMoney = (value) => formatter.format(Number(value || 0));
