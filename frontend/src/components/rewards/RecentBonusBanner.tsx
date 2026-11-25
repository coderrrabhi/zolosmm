import { useQuery } from '@tanstack/react-query';
import { PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function RecentBonusBanner() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['recent-bonus', user?.id],
    enabled: !!user,
    refetchInterval: 30_000,
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 60_000).toISOString();
      const { data } = await (supabase.from as any)('deposit_bonus_transactions')
        .select('bonus_percent,bonus_inr,deposit_inr,created_at').eq('status', 'completed')
        .gte('created_at', since).order('created_at', { ascending: false }).limit(1);
      return data?.[0] ?? null;
    },
  });
  if (!data) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
      <PartyPopper className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-bold text-emerald-800">Congratulations! You received a {Number(data.bonus_percent)}% deposit bonus.</p>
        <p className="text-emerald-700">₹{Number(data.bonus_inr).toLocaleString('en-IN')} bonus added on your ₹{Number(data.deposit_inr).toLocaleString('en-IN')} deposit.</p>
      </div>
    </div>
  );
}
