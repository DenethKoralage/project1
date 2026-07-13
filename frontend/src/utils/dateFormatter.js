/**
 * Formats a Date object or string into: DD-MMM-YYYY h.mmAM/PM
 * Example: 02-Jul-2026 8.59AM
 * 
 * @param {Date|string} dateInput 
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${day}-${month}-${year} ${hours}.${minutes}${ampm}`;
}
