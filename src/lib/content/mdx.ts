import type { ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MdxJsxAttribute {
  type?: string;
  name?: string;
  value?: unknown;
}

interface HastNode {
  type: string;
  tagName?: string;
  name?: string | null;
  properties?: Record<string, unknown>;
  attributes?: MdxJsxAttribute[];
  children?: HastNode[];
}

const DISALLOWED_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "style",
  "svg",
  "foreignobject",
  "base",
  "meta",
  "link",
  "form",
  "template",
]);

const URL_ATTRIBUTE_NAMES = new Set([
  "href",
  "src",
  "xlink:href",
  "xlinkhref",
  "formaction",
  "action",
  "poster",
  "srcdoc",
  "data",
  "srcset",
]);

function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0020\u007f]+/g, "");
}

function sanitizeUrlAttribute(attrName: string, rawValue: string): void {
  if (attrName === "srcdoc") {
    throw new Error('Disallowed attribute "srcdoc" rejected during MDX compilation');
  }
  const candidates =
    attrName === "srcset"
      ? rawValue
          .split(",")
          .map((part) => part.trim().split(/\s+/)[0] ?? "")
          .filter(Boolean)
      : [rawValue];

  for (const candidate of candidates) {
    const collapsed = stripControlChars(candidate).toLowerCase();
    if (!collapsed) {
      continue;
    }
    if (collapsed.startsWith("//")) {
      throw new Error(`Protocol-relative URL "${rawValue}" rejected during MDX compilation`);
    }
    if (
      collapsed.startsWith("#") ||
      collapsed.startsWith("/") ||
      collapsed.startsWith("./") ||
      collapsed.startsWith("../")
    ) {
      continue;
    }
    const schemeMatch = collapsed.match(/^([a-z][a-z0-9+.-]*):/);
    if (schemeMatch) {
      const scheme = schemeMatch[1];
      if (scheme !== "https" && scheme !== "http" && scheme !== "mailto") {
        throw new Error(`Unsafe URL scheme "${scheme}:" rejected during MDX compilation`);
      }
    }
  }
}

function checkAttribute(name: string, value: unknown): void {
  const lower = name.toLowerCase();
  if (lower.startsWith("on") || lower === "dangerouslysetinnerhtml") {
    throw new Error(`Disallowed attribute "${name}" rejected during MDX compilation`);
  }
  if (URL_ATTRIBUTE_NAMES.has(lower)) {
    if (typeof value !== "string") {
      throw new Error(`Non-static expression on URL attribute "${name}" rejected in MDX`);
    }
    sanitizeUrlAttribute(lower, value);
  }
}

function walkHastSafety(node: HastNode): void {
  if (node.type === "mdxjsEsm") {
    throw new Error("Arbitrary ESM import/export statements are disallowed in MDX content");
  }
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    throw new Error("Arbitrary MDX JS expression blocks are disallowed in authored content");
  }

  if (node.type === "element" && node.tagName) {
    const tag = node.tagName.toLowerCase();
    if (DISALLOWED_TAGS.has(tag)) {
      throw new Error(`Disallowed HTML tag <${tag}> rejected during MDX compilation`);
    }

    const props = node.properties ?? {};
    for (const [key, value] of Object.entries(props)) {
      checkAttribute(key, value);
    }

    if (tag === "a" && typeof props.href === "string" && /^https?:\/\//i.test(props.href.trim())) {
      props.rel = "noopener noreferrer";
    }
  }

  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    const jsxTag = (node.name ?? "").toLowerCase();
    if (DISALLOWED_TAGS.has(jsxTag)) {
      throw new Error(`Disallowed MDX JSX element <${jsxTag}> rejected during MDX compilation`);
    }

    const attrs = node.attributes ?? [];
    for (const attr of attrs) {
      if (attr.type === "mdxJsxExpressionAttribute") {
        throw new Error("Spread JSX attributes are disallowed inside authored MDX content");
      }
      if (attr.value !== null && attr.value !== undefined && typeof attr.value !== "string") {
        throw new Error(`Non-static JSX expression value on "${attr.name ?? "prop"}" rejected`);
      }
      if (attr.name) {
        checkAttribute(attr.name, attr.value);
      }
    }

    if (jsxTag === "a") {
      const hrefAttr = attrs.find((attr) => attr.name?.toLowerCase() === "href");
      if (
        hrefAttr &&
        typeof hrefAttr.value === "string" &&
        /^https?:\/\//i.test(hrefAttr.value.trim())
      ) {
        const existingRel = attrs.find((attr) => attr.name?.toLowerCase() === "rel");
        if (existingRel) {
          existingRel.value = "noopener noreferrer";
        } else {
          attrs.push({ type: "mdxJsxAttribute", name: "rel", value: "noopener noreferrer" });
          node.attributes = attrs;
        }
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHastSafety(child);
    }
  }
}

function walkAccessibleMathRegions(node: HastNode): void {
  if (node.type === "element" && node.properties) {
    const className = node.properties.className;
    const classes = Array.isArray(className)
      ? className
      : typeof className === "string"
        ? className.split(/\s+/)
        : [];
    if (classes.includes("katex-display")) {
      node.properties.tabIndex = 0;
      node.properties.role = "region";
      node.properties.ariaLabel = "Persamaan matematika";
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkAccessibleMathRegions(child);
    }
  }
}

export interface LessonHeading {
  id: string;
  text: string;
  depth: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseHeadingTextAndId(rawText: string): { text: string; id: string } {
  const customMatch = rawText.match(/\s*\{#([a-z0-9-]+)\}\s*$/i);
  if (customMatch?.[1]) {
    const cleanText = rawText.slice(0, customMatch.index).trim();
    return { text: cleanText, id: customMatch[1] };
  }
  const cleanText = rawText.trim();
  return { text: cleanText, id: slugifyHeading(cleanText) };
}

function getHastText(node: HastNode): string {
  if (node.type === "text" && typeof (node as unknown as { value?: string }).value === "string") {
    return (node as unknown as { value: string }).value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(getHastText).join("");
  }
  return "";
}

function stripTrailingCustomIdFromHast(node: HastNode): void {
  if (!Array.isArray(node.children) || node.children.length === 0) {
    return;
  }
  const lastChild = node.children[node.children.length - 1] as unknown as {
    type?: string;
    value?: string;
  };
  if (lastChild?.type === "text" && typeof lastChild.value === "string") {
    lastChild.value = lastChild.value.replace(/\s*\{#[a-z0-9-]+\}\s*$/i, "");
  } else {
    stripTrailingCustomIdFromHast(node.children[node.children.length - 1]);
  }
}

function walkHeadingIds(node: HastNode): void {
  if (node.type === "element" && node.tagName && /^h[1-4]$/i.test(node.tagName)) {
    const rawText = getHastText(node);
    const { id } = parseHeadingTextAndId(rawText);
    stripTrailingCustomIdFromHast(node);
    node.properties = node.properties ?? {};
    if (id && !node.properties.id) {
      node.properties.id = id;
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHeadingIds(child);
    }
  }
}

function rehypeHeadingIds() {
  return (tree: HastNode) => {
    walkHeadingIds(tree);
  };
}

export function extractLessonHeadings(mdxBody: string): LessonHeading[] {
  const headings: LessonHeading[] = [];
  const htmlHeadingRegex = /<h([23])\s+id="([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  const seenOffsets: Array<{ index: number; heading: LessonHeading }> = [];

  let htmlMatch: RegExpExecArray | null;
  while ((htmlMatch = htmlHeadingRegex.exec(mdxBody)) !== null) {
    const depth = Number.parseInt(htmlMatch[1], 10);
    const id = htmlMatch[2];
    const text = htmlMatch[3]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    if (id && text) {
      seenOffsets.push({ index: htmlMatch.index, heading: { id, text, depth } });
    }
  }

  const mdHeadingRegex = /^(#{2,3})\s+(.+)$/gm;
  let mdMatch: RegExpExecArray | null;
  while ((mdMatch = mdHeadingRegex.exec(mdxBody)) !== null) {
    const depth = mdMatch[1].length;
    const rawHeading = mdMatch[2].replace(/`/g, "").replace(/\*/g, "");
    const { text, id } = parseHeadingTextAndId(rawHeading);
    if (id && text) {
      seenOffsets.push({ index: mdMatch.index, heading: { id, text, depth } });
    }
  }

  seenOffsets.sort((a, b) => a.index - b.index);
  for (const item of seenOffsets) {
    headings.push(item.heading);
  }
  return headings;
}

function rehypeStrictMdxSafety() {
  return (tree: HastNode) => {
    walkHastSafety(tree);
  };
}

function rehypeAccessibleMathRegions() {
  return (tree: HastNode) => {
    walkAccessibleMathRegions(tree);
  };
}

export type MdxComponentsMap = Record<string, ComponentType<Record<string, unknown>>>;

export async function compileMdxContent(
  source: string
): Promise<ComponentType<{ components?: MdxComponentsMap }>> {
  const { default: MdxComponent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeStrictMdxSafety,
      rehypeHeadingIds,
      [rehypeKatex, { trust: false, strict: true, output: "htmlAndMathml" }],
      rehypeAccessibleMathRegions,
    ],
  });

  return MdxComponent as ComponentType<{ components?: MdxComponentsMap }>;
}
