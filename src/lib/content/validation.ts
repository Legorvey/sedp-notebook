import { PlaceholderPattern } from "./schemas";

export const SHIPPED_LAB_SLUGS = new Set<string>();

export function isLabShipped(slug: string, shippedSlugs: Set<string> = SHIPPED_LAB_SLUGS): boolean {
  return shippedSlugs.has(slug);
}

export interface RestrictedRule {
  label: string;
  pattern: RegExp;
}

export const FORBIDDEN_TEXT_RULES: readonly RestrictedRule[] = [
  { label: "U+2014 em dash", pattern: /\u2014/u },
  { label: "restricted confidentiality label", pattern: /\binternal\s+use\s+only\b/i },
  { label: "restricted slides disclaimer", pattern: /\bslides\s+marked\s+confidential\b/i },
  { label: "restricted bracket marker", pattern: /\[restricted\]/i },
  { label: "restricted conference proceedings ref", pattern: /\bsub[o]ptic\s+2022\b/i },
  { label: "restricted Telkom facility acronym", pattern: /\bosm\s+bdo\b/i },
  { label: "restricted marine structure example", pattern: /\brum[p]on\b/i },
  { label: "internal slide deck filename", pattern: /\bmod(?:ul|ule)[_\s]1\.[123]\b/i },
  { label: "quarantined NEC PDF reference", pattern: /\bnec\s+advances\b/i },
  { label: "internal notes filename", pattern: /\bcatatan\s+sedp-1\b/i },
  { label: "internal project brief filename", pattern: /\bproject_brief\b/i },
  { label: "private editorial source_id", pattern: /\bsrc-(?:sedp|nec|owner)-/i },
];

export interface TextViolation {
  file: string;
  rule: string;
  line: number;
}

export function scanTextForForbiddenContent(file: string, content: string): TextViolation[] {
  const violations: TextViolation[] = [];
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineText = lines[index];
    for (const rule of FORBIDDEN_TEXT_RULES) {
      if (rule.pattern.test(lineText)) {
        violations.push({
          file,
          rule: rule.label,
          line: index + 1,
        });
      }
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
