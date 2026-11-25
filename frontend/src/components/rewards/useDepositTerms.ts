import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TERMS, type BonusTerms } from '@/lib/rewards';

export function useDepositTerms() {
  return useQuery({
    queryKey: ['deposit-terms'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('get_my_deposit_terms');
      if (error) throw error;
      return { bonus: (data?.bonus ?? DEFAULT_TERMS) as BonusTerms, referralFeePercent: Number(data?.referral_fee_percent ?? 0) };
    },
  });
}
