/** Broad experience bucket for public profiles (not exact years). */
export function formatExperienceBucket(years: number | null | undefined): string {
  if (years == null) return "";
  if (years === 0) return "Less than 1 year";
  if (years === 1) return "1 year";
  if (years <= 5) return "2–5 years";
  if (years <= 10) return "6–10 years";
  return "10+ years";
}

export function userTypeLabel(userType: "STUDENT" | "PROFESSIONAL"): string {
  return userType === "STUDENT" ? "Student" : "Working professional";
}
