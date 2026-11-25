// Display-only mirror of the server rules. The database computes the real credit.
export type BonusTerms = {
  enabled: boolean; tier1_min_inr: number; tier1_percent: number; tier2_min_inr: number; tier2_percent: number;
};
export const DEFAULT_TERMS: BonusTerms = { enabled: true, tier1_min_inr: 200, tier1_percent: 5, tier2_min_inr: 1000, tier2_percent: 10 };

export function bonusPercent(amountInr: number, t: BonusTerms = DEFAULT_TERMS): number {
  if (!t.enabled || !Number.isFinite(amountInr)) return 0;
  if (amountInr >= Number(t.tier2_min_inr)) return Number(t.tier2_percent);
  if (amountInr >= Number(t.tier1_min_inr)) return Number(t.tier1_percent);
  return 0;
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export function depositBreakdown(amountInr: number, t: BonusTerms = DEFAULT_TERMS, referralFeePercent = 0) {
  const pct = bonusPercent(amountInr, t);
  const bonus = r2((amountInr * pct) / 100);
  const fee = r2((amountInr * referralFeePercent) / 100);
  const net = r2(amountInr - fee);
  return { deposit: amountInr, bonusPercent: pct, bonus, referralFee: fee, netDeposit: net, totalCredit: r2(net + bonus) };
}

export const REF_STORAGE_KEY = 'pending_referral_code';
export function captureReferralFromUrl(search: string) {
  const code = new URLSearchParams(search).get('ref');
  if (code && /^[A-Za-z0-9]{6,12}$/.test(code)) {
    try { localStorage.setItem(REF_STORAGE_KEY, code.toUpperCase()); } catch { /* ignore */ }
  }
}
export function maskEmail(e?: string | null) {
  if (!e || !e.includes('@')) return 'User';
  const [u, d] = e.split('@');
  return `${u.slice(0, 2)}${'*'.repeat(Math.max(u.length - 2, 2))}@${d}`;
}
