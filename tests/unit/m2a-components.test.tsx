import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OpticalBudgetLab } from "@/features/simulators/components/optical-budget-lab";
import { OpticalCapacityLab } from "@/features/simulators/components/optical-capacity-lab";

afterEach(() => {
  cleanup();
});

describe("M2-A interactive .abyss-bay simulator UIs", () => {
  it("renders OpticalCapacityLab defaults, switches DWDM valid/overflow, restores alert focus, and syncs table", () => {
    const { container } = render(<OpticalCapacityLab />);

    const readouts = screen.getByTestId("capacity-readouts");
    expect(readouts).toHaveTextContent("17.60 Tbps");
    expect(readouts).toHaveTextContent("281.60 Tbps");
    expect(readouts).toHaveTextContent("563.20 Tbps");
    expect(readouts).toHaveTextContent("4.00 bit/s/Hz");
    expect(container.textContent).not.toContain("))");

    const table = screen.getByRole("table");
    const activeRow = within(table)
      .getByText(/16 FP \(Aktif\)/)
      .closest("tr");
    expect(activeRow).toHaveTextContent("281.600");
    expect(activeRow).toHaveTextContent("563.200");

    // Step button increment changes N_fp from 16 -> 17, then decrement back to 16
    fireEvent.click(
      screen.getByRole("button", { name: /Tambah Jumlah Pasangan Serat \(N_fp\) sebesar 1 FP/i })
    );
    expect(readouts).toHaveTextContent("299.20 Tbps");
    fireEvent.click(
      screen.getByRole("button", { name: /Kurangi Jumlah Pasangan Serat \(N_fp\) sebesar 1 FP/i })
    );
    expect(readouts).toHaveTextContent("281.60 Tbps");

    // Preset DWDM 100G valid calculation
    fireEvent.click(screen.getByRole("button", { name: /Kanal DWDM 100G/i }));
    expect(readouts).toHaveTextContent("32.00 Tbps");
    expect(readouts).toHaveTextContent("90.9%");

    // Trigger 90-channel overflow alert on 4.4 THz / 50 GHz and reset via alert banner button
    const chInput = screen.getByLabelText("Jumlah Kanal Aktif (N_lambda)");
    fireEvent.change(chInput, { target: { value: "90" } });

    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((el) => /Maksimum 88 kanal/.test(el.textContent ?? ""))).toBe(true);
    expect(chInput).toHaveAttribute("aria-invalid", "true");

    const resetButtons = screen.getAllByRole("button", { name: "Atur Ulang Parameter" });
    expect(resetButtons).toHaveLength(2);
    fireEvent.click(resetButtons[1]);
    expect(screen.getByTestId("capacity-readouts")).toHaveTextContent("281.60 Tbps");
    expect(container.textContent).not.toContain("NaN");
  });

  it("renders OpticalBudgetLab BOL/EOL OSNR, Repeaterless heading, table parity, and zero NaN on cleared inputs", () => {
    const { container } = render(<OpticalBudgetLab />);

    const readouts = screen.getByTestId("budget-readouts");
    expect(readouts).toHaveTextContent("100 span (10.20 dB/span)");
    expect(readouts).toHaveTextContent("20.80 dB");
    expect(readouts).toHaveTextContent("17.30 dB");
    expect(screen.getByText(/BUKAN GSNR penuh/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Penafian Pemodelan Edukatif")).toBeInTheDocument();

    // Verify table parity with Span 100 EOL 17.30 dB
    const table = screen.getByRole("table");
    const span100Row = within(table).getByText("Span 100").closest("tr");
    expect(span100Row).toHaveTextContent("20.80");
    expect(span100Row).toHaveTextContent("17.30");

    // Clearing Margin Perbaikan, Margin Penuaan, and Ambang Ilustrasi OSNR must NEVER leak NaN/Infinity
    const mRepInput = screen.getByLabelText("Margin Perbaikan");
    const mAgeInput = screen.getByLabelText("Margin Penuaan");
    const targetInput = screen.getByLabelText("Ambang Ilustrasi OSNR ASE");
    fireEvent.change(mRepInput, { target: { value: "" } });
    fireEvent.change(mAgeInput, { target: { value: "" } });
    fireEvent.change(targetInput, { target: { value: "" } });
    expect(container.textContent).not.toContain("NaN");
    expect(container.textContent).not.toContain("Infinity");

    // Alert banner reset recovers cleanly
    const resetButtons = screen.getAllByRole("button", { name: "Atur Ulang Parameter" });
    fireEvent.click(resetButtons[1]);
    expect(readouts).toHaveTextContent("17.30 dB");

    // Switching to Total EDFA mode with 18 dBm / 100 channels stays -2.00 dBm/kanal
    fireEvent.click(screen.getByRole("button", { name: "Total EDFA (P_total)" }));
    expect(readouts).toHaveTextContent("-2.00 dBm/kanal");

    // Trigger high launch power Kerr nonlinearity warning
    fireEvent.click(screen.getByRole("button", { name: "Per-Kanal (P_ch)" }));
    const pchInput = screen.getByLabelText("Daya Luncur per Kanal (P_ch)");
    fireEvent.change(pchInput, { target: { value: "5" } });
    expect(screen.getByText(/efek Kerr \(SNR_NLI\)/i)).toBeInTheDocument();

    // Switch to Repeaterless and verify mode-specific heading, table rows, and deficit banner
    fireEvent.click(screen.getByRole("button", { name: "Repeaterless" }));
    expect(readouts).toHaveTextContent("24.00 dB");
    expect(
      screen.getByRole("heading", { name: /Batas Pendekatan: Kepekaan Penerima/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Defisit daya EOL sebesar 1\.50 dB/i).length).toBeGreaterThanOrEqual(
      1
    );
    const repLessTable = screen.getByRole("table");
    expect(within(repLessTable).getByText("120 km").closest("tr")).toHaveTextContent("-29.50");

    const distInput = screen.getByLabelText("Panjang Rute Kabel Laut (L)");
    fireEvent.change(distInput, { target: { value: "0" } });
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toContain("NaN");

    fireEvent.click(screen.getAllByRole("button", { name: "Atur Ulang Parameter" })[0]);
    expect(screen.getByTestId("budget-readouts")).toHaveTextContent("24.00 dB");
  });
});
