import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
});

describe("Phase 0A smoke checks", () => {
  it("merges Tailwind classes cleanly via cn helper", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("toggles Pelagic Light and Abyssal Dark mode on documentElement", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Tema: Pelagic Light/i });

    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(button);

    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.textContent).toContain("Abyssal Dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
