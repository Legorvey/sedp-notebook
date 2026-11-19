import type { ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const DISALLOWED_TAGS = new Set(["script", "iframe", "object", "embed", "style"]);

function sanitizeHrefOrSrc(urlValue: string): void {
  const normalized = urlValue.trim().toLowerCase();
  if (normalized.startsWith("javascript:") || normalized.startsWith("data:text/html")) {
    throw new Error(`Unsafe URL scheme rejected during MDX compilation: "${urlValue}"`);
  }
}

function walkHast(node: HastNode): void {
  if (node.type === "element" && node.tagName) {
    const tag = node.tagName.toLowerCase();
    if (DISALLOWED_TAGS.has(tag)) {
      throw new Error(`Disallowed HTML tag <${tag}> rejected during MDX compilation`);
    }

    const props = node.properties ?? {};
    for (const [key, value] of Object.entries(props)) {
      if (key.toLowerCase().startsWith("on")) {
        throw new Error(`Disallowed inline event handler "${key}" rejected during MDX compilation`);
      }
      if ((key === "href" || key === "src") && typeof value === "string") {
        sanitizeHrefOrSrc(value);
      }
    }

    if (tag === "a" && typeof props.href === "string") {
      const href = props.href.trim();
      if (/^https?:\/\//i.test(href)) {
        props.rel = "noopener noreferrer";
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkHast(child);
    }
  }
}

function rehypeStrictMdxSafety() {
  return (tree: HastNode) => {
    walkHast(tree);
  };
}

export async function compileMdxContent(source: string): Promise<ComponentType> {
  const { default: MdxComponent } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeStrictMdxSafety,
      [rehypeKatex, { trust: false, strict: true, output: "htmlAndMathml" }],
    ],
  });

  return MdxComponent;
}
