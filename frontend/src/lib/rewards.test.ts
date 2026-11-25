import { describe, it, expect } from 'vitest';
import { bonusPercent, depositBreakdown } from './rewards';

describe('deposit bonus tiers', () => {
  it('₹100 gets no bonus', () => expect(depositBreakdown(100).bonus).toBe(0));
  it('₹200 gets ₹10', () => expect(depositBreakdown(200).bonus).toBe(10));
  it('₹500 gets ₹25', () => expect(depositBreakdown(500).bonus).toBe(25));
  it('₹999 gets ₹49.95', () => expect(depositBreakdown(999).bonus).toBe(49.95));
  it('₹1,000 gets ₹100', () => expect(depositBreakdown(1000).bonus).toBe(100));
  it('₹5,000 gets ₹500', () => expect(depositBreakdown(5000).bonus).toBe(500));
  it('₹199.99 is below the 5% tier', () => expect(bonusPercent(199.99)).toBe(0));
});

describe('referral deduction', () => {
  it('₹1,000 referred deposit: ₹950 net, ₹50 to referrer, ₹1,050 total', () => {
    const b = depositBreakdown(1000, undefined, 5);
    expect(b.netDeposit).toBe(950); expect(b.referralFee).toBe(50); expect(b.totalCredit).toBe(1050);
  });
  it('₹500 referred deposit: ₹475 net, ₹25 to referrer', () => {
    const b = depositBreakdown(500, undefined, 5);
    expect(b.netDeposit).toBe(475); expect(b.referralFee).toBe(25);
  });
  it('no referrer: full deposit plus bonus', () => expect(depositBreakdown(1000, undefined, 0).totalCredit).toBe(1100));
});
