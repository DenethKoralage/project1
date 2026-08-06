/**
 * Wraps a cell value in double-quotes and escapes embedded quotes if the
 * value contains commas, double-quotes, or newlines (RFC 4180).
 *
 * @param {*} value
 * @returns {string}
 */
export const csvEscape = (value) => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Builds a CSV string from a 2-D array of rows and triggers a client-side
 * file download. The first element of `rows` is treated as the header row.
 *
 * No server round-trip — uses Blob + temporary <a> element.
 *
 * @param {Array<Array<*>>} rows   – e.g. [["Date","Amount"], ["2026-01-01", 500]]
 * @param {string}          filename – e.g. "incomes.csv"
 */
export function downloadCsv(rows, filename) {
  const csvContent = rows
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
