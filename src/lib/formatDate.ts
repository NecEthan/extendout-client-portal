// "2026-11-04T11:46:51.032Z" -> "04 Nov 2026"
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
