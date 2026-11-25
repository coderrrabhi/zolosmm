import { useQuery } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDepositTerms } from './useDepositTerms';

export function BonusHistoryCard() {
  const { user } = useAuth();
  const { data: terms } = useDepositTerms();
  const { data = [] } = useQuery({
    queryKey: ['my-bonus-history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('deposit_bonus_transactions').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data as any[];
    },
  });
  const t = terms?.bonus;
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4 text-emerald-600" />Deposit Bonus</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {t && (t.enabled ? (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted p-2"><p className="font-bold">Below ₹{Number(t.tier1_min_inr)}</p><p>0%</p></div>
            <div className="rounded-lg bg-muted p-2"><p className="font-bold">₹{Number(t.tier1_min_inr)}+</p><p>{Number(t.tier1_percent)}% bonus</p></div>
            <div className="rounded-lg bg-emerald-50 p-2"><p className="font-bold">₹{Number(t.tier2_min_inr)}+</p><p>{Number(t.tier2_percent)}% bonus</p></div>
          </div>) : <p className="text-sm text-muted-foreground">Deposit bonus is currently paused.</p>)}
        {terms && terms.referralFeePercent > 0 && <p className="text-xs text-muted-foreground">You joined with a referral link: {terms.referralFeePercent}% of each deposit goes to the person who referred you.</p>}
        {data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-muted-foreground"><th className="py-1">Date</th><th>Deposit</th><th>Bonus</th><th>Status</th></tr></thead>
              <tbody>{data.map((r) => (
                <tr key={r.id} className="border-t"><td className="py-1.5">{format(new Date(r.created_at), 'dd MMM yy')}</td>
                  <td>₹{Number(r.deposit_inr).toLocaleString('en-IN')}</td><td>{Number(r.bonus_percent)}% · ₹{Number(r.bonus_inr)}</td>
                  <td><Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>{r.status}</Badge></td></tr>))}</tbody>
            </table>
          </div>)}
      </CardContent>
    </Card>
  );
}
