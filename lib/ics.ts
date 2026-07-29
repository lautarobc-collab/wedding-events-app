function icsEscape(text: string): string {
  return text.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

function icsDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

export function buildIcs(
  calendarName: string,
  events: { uid: string; date: string; summary: string }[],
): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Coordina//ES", `X-WR-CALNAME:${icsEscape(calendarName)}`];

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}@coordina`,
      `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
      `SUMMARY:${icsEscape(event.summary)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
