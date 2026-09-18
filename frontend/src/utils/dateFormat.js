/**
 * Formats a date string into Asia/Kolkata timezone with format:
 * dd-MMM-yyyy hh:mm:ss a (e.g., 18-Sep-2026 11:59:48 AM)
 */
export const formatKolkataDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // If dateString is in ISO format without offset, treat it as Asia/Kolkata (IST = UTC+05:30)
    let cleanStr = String(dateString).trim();
    if (!cleanStr.includes('Z') && !cleanStr.includes('+') && !cleanStr.match(/-\d\d:\d\d$/)) {
      cleanStr = cleanStr + '+05:30';
    }

    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) return dateString;

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    const map = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const day = map.day || '01';
    const month = map.month || 'Jan';
    const year = map.year || '1970';
    const hour = map.hour || '12';
    const minute = map.minute || '00';
    const second = map.second || '00';
    const dayPeriod = (map.dayPeriod || 'AM').toUpperCase();

    return `${day}-${month}-${year} ${hour}:${minute}:${second} ${dayPeriod}`;
  } catch {
    return dateString;
  }
};
