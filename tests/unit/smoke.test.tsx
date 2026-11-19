import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_STORAGE_KEY, ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("M0 UI & theme primitive checks", () => {
  it("merges Tailwind classes cleanly via cn helper", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("toggles Pelagic Light and Abyssal Dark mode on documentElement and persists to localStorage", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Mode Abyssal Dark/i });

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("Nonaktif");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Aktif");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("syncs initial ThemeToggle state when documentElement already carries .dark", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Mode Abyssal Dark/i });

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Aktif");
  });

  it("degrades safely when localStorage throws during theme toggle", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /Mode Abyssal Dark/i });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("enforces touch targets, wrapping, opaque surfaces, and click/keyboard suppression on disabled Button", () => {
    const disabledSpy = vi.fn();
    const ariaDisabledSpy = vi.fn();

    render(
      <div>
        <Button>Aksi Utama</Button>
        <Button variant="outline" disabled onClick={disabledSpy}>
          Nonaktif
        </Button>
        <Button variant="destructive" aria-disabled="true" onClick={ariaDisabledSpy}>
          Hapus
        </Button>
      </div>
    );

    const primaryBtn = screen.getByRole("button", { name: "Aksi Utama" });
    expect(primaryBtn.className).toContain("min-h-[44px]");
    expect(primaryBtn.className).toContain("min-w-[44px]");
    expect(primaryBtn.className).toContain("whitespace-normal");
    expect(primaryBtn.className).toContain("focus-visible:outline-2");
    expect(primaryBtn.className).not.toMatch(/\bbg-primary\/\d+/);

    const disabledBtn = screen.getByRole("button", { name: "Nonaktif" });
    expect(disabledBtn).toBeDisabled();
    expect(disabledBtn.className).toContain("border-input");
    expect(disabledBtn.className).toContain("disabled:cursor-not-allowed");
    expect(disabledBtn.className).not.toContain("disabled:pointer-events-none");
    fireEvent.click(disabledBtn);
    expect(disabledSpy).not.toHaveBeenCalled();

    const ariaDisabledBtn = screen.getByRole("button", { name: "Hapus" });
    expect(ariaDisabledBtn.className).toContain("aria-disabled:cursor-not-allowed");
    fireEvent.click(ariaDisabledBtn);
    fireEvent.keyDown(ariaDisabledBtn, { key: "Enter" });
    fireEvent.keyDown(ariaDisabledBtn, { key: " " });
    expect(ariaDisabledSpy).not.toHaveBeenCalled();
  });
});
