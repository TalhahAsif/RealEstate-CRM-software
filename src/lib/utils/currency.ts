export const CURRENCY_UNITS = ["lac", "cr"] as const;
export type CurrencyUnit = (typeof CURRENCY_UNITS)[number];

const UNIT_MULTIPLIER: Record<CurrencyUnit, number> = {
  lac: 100_000,
  cr: 10_000_000,
};

/** Converts an amount typed against a lac/cr unit (e.g. "3.5" + "cr") into a raw rupee number. */
export function toRupees(amount: string, unit: CurrencyUnit): number | undefined {
  if (!amount.trim()) return undefined;
  const parsed = Number(amount);
  if (Number.isNaN(parsed)) return undefined;
  return Math.round(parsed * UNIT_MULTIPLIER[unit]);
}

/** Converts a raw rupee number into the best-fit lac/cr amount for editing. */
export function fromRupees(value?: number | null): { amount: string; unit: CurrencyUnit } {
  if (value == null || Number.isNaN(value) || value === 0) return { amount: "", unit: "lac" };
  const unit: CurrencyUnit = Math.abs(value) >= UNIT_MULTIPLIER.cr ? "cr" : "lac";
  const amount = value / UNIT_MULTIPLIER[unit];
  return { amount: String(Number(amount.toFixed(4))), unit };
}
