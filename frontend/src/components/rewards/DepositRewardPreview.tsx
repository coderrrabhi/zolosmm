import { Gift } from 'lucide-react';
import { depositBreakdown, DEFAULT_TERMS } from '@/lib/rewards';
import { useDepositTerms } from './useDepositTerms';

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function DepositRewardPreview({ amount }: { amount: string }) {
  const { data } = useDepositTerms();
  const terms = data?.bonus ?? DEFAULT_TERMS;
  const amt = Number(amount || 0);
  if (!Number.isFinite(amt) || amt <= 0) return null;
  const b = depositBreakdown(amt, terms, data?.referralFeePercent ?? 0);
  return (
    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-[12px] text-slate-700">
      {b.bonusPercent > 0 ? (
        <p className="mb-2 flex items-center gap-1.5 font-bold text-emerald-700"><Gift className="h-3.5 w-3.5" />Congratulations! You'll receive a {b.bonusPercent}% deposit bonus.</p>
      ) : terms.enabled ? (
        <p className="mb-2 text-slate-500">Deposit {inr(Number(terms.tier1_min_inr))}+ to get {terms.tier1_percent}% bonus, {inr(Number(terms.tier2_min_inr))}+ for {terms.tier2_percent}%.</p>
      ) : null}
      <div className="grid grid-cols-2 gap-y-1">
        <span>Deposit</span><span className="text-right font-semibold">{inr(b.deposit)}</span>
        {b.referralFee > 0 && (<><span>Referral commission ({data?.referralFeePercent}%)</span><span className="text-right font-semibold text-rose-600">−{inr(b.referralFee)}</span></>)}
        <span>Bonus ({b.bonusPercent}%)</span><span className="text-right font-semibold text-emerald-700">+{inr(b.bonus)}</span>
        <span className="font-bold">Total wallet credit</span><span className="text-right font-extrabold">{inr(b.totalCredit)}</span>
      </div>
    </div>
  );
}
