import { PlaceholderPattern } from "./schemas";

export const SHIPPED_LAB_SLUGS = new Set<string>([
  "eksplorer-sistem",
  "kapasitas-optik",
  "anggaran-daya",
]);
export const SHIPPED_MODULE_CODES = new Set<string>(["1.1", "1.2", "1.3"]);

export function isLabShipped(slug: string, shippedSlugs: Set<string> = SHIPPED_LAB_SLUGS): boolean {
  return shippedSlugs.has(slug);
}

export interface RestrictedRule {
  label: string;
  pattern: RegExp;
}

export const FORBIDDEN_TEXT_RULES: readonly RestrictedRule[] = [
  { label: "U+2014 em dash", pattern: /\u2014/u },
  { label: "HTML em dash entity", pattern: /(?:&[m]dash;|&#[8]212;|&#[x]2014;)/i },
  { label: "restricted confidentiality label", pattern: /\binternal\s+use\s+only\b/i },
  { label: "restricted slides disclaimer", pattern: /\bslides\s+marked\s+confidential\b/i },
  { label: "restricted bracket marker", pattern: /\[restricted\]/i },
  {
    label: "restricted conference proceedings ref",
    pattern: /(?<![a-z0-9])sub[o]ptic\s+2022(?![a-z0-9])/i,
  },
  { label: "restricted Telkom facility acronym", pattern: /(?<![a-z0-9])osm\s+bdo(?![a-z0-9])/i },
  { label: "restricted marine structure example", pattern: /(?<![a-z0-9])rum[p]on(?![a-z0-9])/i },
  {
    label: "internal slide deck filename",
    pattern:
      /(?<![a-z0-9])(?:modul_1\.[123]|module[-_\s]+1\.[123]|modul[-_\s]+1\.2\s+(?:the\s+global|revisi)|a[_ ]journey[_ ]through[_ ]time|submarine[_ ]cable[_ ]system[_ ]architecture[_ ]compressed)(?![0-9])/i,
  },
  { label: "quarantined NEC PDF reference", pattern: /(?<![a-z0-9])nec\s+advances(?![a-z0-9])/i },
  { label: "internal notes filename", pattern: /(?<![a-z0-9])catatan[-_\s]+sedp-1(?![0-9])/i },
  {
    label: "internal overview brief filename",
    pattern: /(?<![a-z0-9])pr[o]ject[-_\s]?brief(?![a-z0-9])/i,
  },
  { label: "private editorial source_id", pattern: /(?<![a-z0-9])src-(?:sedp|nec|owner)-/i },
];

export interface TextViolation {
  file: string;
  rule: string;
  line: number;
}

export function scanTextForForbiddenContent(file: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const matchedPerRule = new Set<string>();
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineText = lines[index];
    for (const rule of FORBIDDEN_TEXT_RULES) {
      if (rule.pattern.test(lineText)) {
        matchedPerRule.add(rule.label);
        violations.push({
          file,
          rule: rule.label,
          line: index + 1,
        });
      }
    }
  }

  const normalizedMultiline = content.replace(/\r?\n\s*/g, " ");
  for (const rule of FORBIDDEN_TEXT_RULES) {
    if (!matchedPerRule.has(rule.label) && rule.pattern.test(normalizedMultiline)) {
      violations.push({
        file,
        rule: `${rule.label} (multiline)`,
        line: 1,
      });
    }
  }

  return violations;
}

export function scanSrcLineForApiV1(file: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const apiV1Pattern = new RegExp("/api/" + "v1\\b", "i");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (apiV1Pattern.test(lines[index])) {
      violations.push({
        file,
        rule: "Phase F reserved REST prefix in src/",
        line: index + 1,
      });
    }
  }

  if (violations.length === 0) {
    const collapsed = content.replace(/\r?\n\s*/g, "");
    if (apiV1Pattern.test(collapsed)) {
      violations.push({
        file,
        rule: "Phase F reserved REST prefix in src/ (multiline)",
        line: 1,
      });
    }
  }

  return violations;
}

export function scanContentBodyForPlaceholders(file: string, body: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const lines = body.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (PlaceholderPattern.test(lines[index])) {
      violations.push({
        file,
        rule: "unresolved placeholder/UNINSPECTED marker in content body",
        line: index + 1,
      });
    }
  }

  return violations;
}
