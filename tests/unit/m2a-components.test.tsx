import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OpticalBudgetLab } from "@/features/simulators/components/optical-budget-lab";
import { OpticalCapacityLab } from "@/features/simulators/components/optical-capacity-lab";

afterEach(() => {
  cleanup();
});

describe("M2-A interactive .abyss-bay simulator UIs", () => {
  it("renders OpticalCapacityLab defaults, switches modes, catches slot overflow, and resets cleanly", () => {
    render(<OpticalCapacityLab />);

    const readouts = screen.getByTestId("capacity-readouts");
    expect(readouts).toHaveTextContent("17.60 Tbps");
    expect(readouts).toHaveTextContent("281.60 Tbps");
    expect(readouts).toHaveTextContent("563.20 Tbps");

    const table = screen.getByRole("table");
    const activeRow = within(table)
      .getByText(/16 FP \(Aktif\)/)
      .closest("tr");
    expect(activeRow).toHaveTextContent("281.600");
    expect(activeRow).toHaveTextContent("563.200");

    // Step button increment changes N_fp from 16 -> 17 without needing drag
    fireEvent.click(
      screen.getByRole("button", { name: /Tambah Jumlah Pasangan Serat \(N_fp\) sebesar 1 FP/i })
    );
    expect(readouts).toHaveTextContent("299.20 Tbps");

    // Switch to DWDM Channel mode and trigger 90-channel overflow alert on 4.4 THz / 50 GHz
    fireEvent.click(screen.getByRole("button", { name: "Jumlah Kanal DWDM" }));
    const chInput = screen.getByLabelText("Jumlah Kanal Aktif (N_lambda)");
    fireEvent.change(chInput, { target: { value: "90" } });

    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((el) => /Maksimum 88 kanal/.test(el.textContent ?? ""))).toBe(true);

    // One-click recovery returns defaults
    fireEvent.click(screen.getAllByRole("button", { name: "Atur Ulang Parameter" })[0]);
    expect(screen.getByTestId("capacity-readouts")).toHaveTextContent("281.60 Tbps");
  });

  it("renders OpticalBudgetLab repeatered BOL/EOL OSNR, repeaterless power, GSNR caveat, and invalid recovery", () => {
    render(<OpticalBudgetLab />);

    const readouts = screen.getByTestId("budget-readouts");
    expect(readouts).toHaveTextContent("100 span (10.20 dB/span)");
    expect(readouts).toHaveTextContent("20.80 dB");
    expect(readouts).toHaveTextContent("17.30 dB");
    expect(screen.getByText(/BUKAN GSNR penuh/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Penafian Pemodelan Edukatif")).toBeInTheDocument();

    // Switching to Total EDFA mode with 18 dBm / 100 channels stays -2.00 dBm/kanal
    fireEvent.click(screen.getByRole("button", { name: "Total EDFA (P_total)" }));
    expect(readouts).toHaveTextContent("-2.00 dBm/kanal");

    // Trigger high launch power Kerr nonlinearity warning
    fireEvent.click(screen.getByRole("button", { name: "Per-Kanal (P_ch)" }));
    const pchInput = screen.getByLabelText("Daya Luncur per Kanal (P_ch)");
    fireEvent.change(pchInput, { target: { value: "5" } });
    expect(screen.getByText(/efek Kerr \(SNR_NLI\)/i)).toBeInTheDocument();

    // Switch to Repeaterless and inspect exponential loss + invalid distance alert recovery
    fireEvent.click(screen.getByRole("button", { name: "Repeaterless" }));
    expect(readouts).toHaveTextContent("24.00 dB");
    const distInput = screen.getByLabelText("Panjang Rute Kabel Laut (L)");
    fireEvent.change(distInput, { target: { value: "0" } });
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getAllByRole("button", { name: "Atur Ulang Parameter" })[0]);
    expect(screen.getByTestId("budget-readouts")).toHaveTextContent("24.00 dB");
  });
});
