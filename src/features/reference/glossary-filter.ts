import type { GlossaryEntry } from "@/lib/content/schemas";

export const GLOSSARY_CATEGORY_LABELS: Record<string, string> = {
  "infrastruktur-darat": "Infrastruktur Darat & Pantai",
  "dry-plant": "Dry Plant (CLS)",
  "wet-plant": "Wet Plant (Bawah Laut)",
};

export function getGlossaryCategoryLabel(category: string): string {
  return GLOSSARY_CATEGORY_LABELS[category] ?? category;
}

export function filterGlossaryEntries(
  entries: readonly GlossaryEntry[],
  query: string,
  selectedCategory: string
): GlossaryEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (selectedCategory !== "all" && entry.category !== selectedCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystacks = [
      entry.term_en,
      entry.term_id,
      entry.abbr ?? "",
      entry.definition_id,
      entry.engineering_note_id ?? "",
      ...entry.aliases,
    ];

    return haystacks.some((field) => field.toLowerCase().includes(normalizedQuery));
  });
}
