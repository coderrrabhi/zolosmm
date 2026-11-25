import { useQuery } from '@tanstack/react-query';
import { Copy, Share2, Users, UserCheck, IndianRupee, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageMeta } from '@/components/seo/PageMeta';

export default function Referrals() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['my-referrals', user?.id], enabled: !!user, refetchInterval: 30_000,
    queryFn: async () => { const { data, error } = await (supabase.rpc as any)('get_my_referral_dashboard'); if (error) throw error; return data as any; },
  });
  const link = data?.code ? `${window.location.origin}/register?ref=${data.code}` : '';
  const copy = async () => { await navigator.clipboard.writeText(link); toast.success('Referral link copied'); };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Join ZoloSMM', text: 'Grow your social media with ZoloSMM', url: link }); } catch { /* cancelled */ } }
    else copy();
  };
  const stats = [
    { icon: Users, label: 'Total Referrals', value: data?.total_referrals ?? 0 },
    { icon: UserCheck, label: 'Active Referrals', value: data?.active_referrals ?? 0 },
    { icon: IndianRupee, label: 'Total Earnings', value: `₹${Number(data?.total_earnings_inr ?? 0).toLocaleString('en-IN')}` },
    { icon: Percent, label: 'Commission', value: `${Number(data?.commission_percent ?? 0)}%` },
  ];
  return (
    <DashboardLayout>
      <PageMeta title="My Referrals — ZoloSMM" description="Share your referral link and earn commission on every deposit." canonicalPath="/referrals" />
      <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
        <div><h1 className="text-2xl font-extrabold">My Referrals</h1>
          <p className="text-sm text-muted-foreground">Earn {Number(data?.commission_percent ?? 5)}% of every successful deposit made by people you refer — paid straight to your wallet.</p></div>
        {data && !data.enabled && <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">Referral program is paused right now.</p>}
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">My Referral Link</CardTitle></CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={isLoading ? 'Loading…' : link} className="font-mono text-xs" />
            <div className="flex gap-2"><Button onClick={copy} disabled={!link}><Copy className="h-4 w-4" />Copy</Button>
              <Button variant="outline" onClick={share} disabled={!link}><Share2 className="h-4 w-4" />Share</Button></div>
          </CardContent></Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (<Card key={s.label}><CardContent className="p-4"><s.icon className="h-4 w-4 text-primary mb-2" />
            <p className="text-xl font-extrabold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>))}
        </div>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Referral History</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            {(data?.history ?? []).length === 0 ? <p className="text-sm text-muted-foreground py-4">No commissions yet. Share your link to start earning.</p> : (
              <table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground text-xs"><th className="py-2">Referred User</th><th>Deposit</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>{data.history.map((h: any, i: number) => (<tr key={i} className="border-t">
                  <td className="py-2">{h.user}</td><td>₹{Number(h.deposit_inr).toLocaleString('en-IN')}</td><td className="font-semibold">₹{Number(h.commission_inr).toLocaleString('en-IN')}</td>
                  <td><Badge variant={h.status === 'completed' ? 'default' : 'secondary'}>{h.status === 'completed' ? 'Completed' : 'Reversed'}</Badge></td>
                  <td className="text-xs">{format(new Date(h.created_at), 'dd MMM yy')}</td></tr>))}</tbody></table>)}
          </CardContent></Card>
        {(data?.referred_users ?? []).length > 0 && (
          <Card><CardHeader className="pb-2"><CardTitle className="text-base">People You Referred</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{data.referred_users.map((u: any, i: number) => (<Badge key={i} variant="outline">{u.user} · {format(new Date(u.joined), 'dd MMM')}</Badge>))}</CardContent></Card>)}
      </div>
    </DashboardLayout>
  );
}
