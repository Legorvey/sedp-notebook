import type { ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
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
  if (lower.startsWith("on")) {
    throw new Error(`Disallowed inline event handler "${name}" rejected during MDX compilation`);
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

export async function compileMdxContent(source: string): Promise<ComponentType> {
  const { default: MdxComponent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeStrictMdxSafety,
      [rehypeKatex, { trust: false, strict: true, output: "htmlAndMathml" }],
      rehypeAccessibleMathRegions,
    ],
  });

  return MdxComponent;
}
