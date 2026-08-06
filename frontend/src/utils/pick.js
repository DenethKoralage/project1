/**
 * Reads a property from a backend response object that may arrive as
 * either PascalCase (.NET / C#) or camelCase (JS convention).
 *
 * @param {object} item
 * @param {string} pascal  – e.g. "Amount"
 * @param {string} camel   – e.g. "amount"
 * @returns {*}
 *
 * @example
 * pick(income, "Amount", "amount")   // income.Amount ?? income.amount
 */
export const pick = (item, pascal, camel) => item?.[pascal] ?? item?.[camel];
