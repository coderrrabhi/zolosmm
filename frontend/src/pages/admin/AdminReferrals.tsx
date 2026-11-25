import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Users, Search, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAGE, Pager, downloadCsv } from '@/components/admin/AdminTablePager';

export default function AdminReferrals() {
  const qc = useQueryClient();
  const { data: s } = useQuery({ queryKey: ['referral-settings'], queryFn: async () => (await (supabase.from as any)('referral_settings').select('*').eq('id', 1).single()).data });
  const { data: o } = useQuery({ queryKey: ['admin-referrals'], refetchInterval: 30_000, queryFn: async () => { const { data, error } = await (supabase.rpc as any)('admin_referral_overview'); if (error) throw error; return data as any; } });
  const [en, setEn] = useState(true); const [pct, setPct] = useState('5');
  useEffect(() => { if (s) { setEn(s.enabled); setPct(String(s.commission_percent)); } }, [s]);
  const [q, setQ] = useState(''); const [p1, setP1] = useState(0); const [p2, setP2] = useState(0);
  const match = (...v: (string | null)[]) => !q || v.some((x) => x?.toLowerCase().includes(q.toLowerCase()));
  const comms = useMemo(() => (o?.commissions ?? []).filter((c: any) => match(c.referrer_email, c.referred_email, c.payment_reference)), [o, q]);
  const rels = useMemo(() => (o?.relationships ?? []).filter((r: any) => match(r.referrer_email, r.referred_email, r.code)), [o, q]);

  const save = async () => {
    const { error } = await (supabase.rpc as any)('admin_update_reward_settings', { p: { referral: { enabled: en, commission_percent: Number(pct) } } });
    if (error) return toast.error(error.message); toast.success('Referral settings saved'); qc.invalidateQueries({ queryKey: ['referral-settings'] });
  };
  const inr = (n: any) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`;
  const stats = [['Total Referrals', o?.total_referrals ?? 0], ['Active Referrals', o?.active_referrals ?? 0], ['Total Commissions', inr(o?.total_commission_inr)], ['Referred Deposits', inr(o?.total_referred_deposits_inr)]];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div>
          <div><h1 className="text-2xl font-bold">Referral Management</h1><p className="text-sm text-muted-foreground">Commission is taken from the referred user's verified deposit and paid to the referrer.</p></div></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(([l, v]) => (<Card key={l as string}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></CardContent></Card>))}</div>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Settings</CardTitle></CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex items-center gap-3"><Switch checked={en} onCheckedChange={setEn} /><span className="text-sm font-medium">{en ? 'Referral system ON' : 'Referral system OFF'}</span></div>
            <div><Label>Commission %</Label><Input type="number" step="0.1" value={pct} onChange={(e) => setPct(e.target.value)} className="w-32" /></div>
            <Button onClick={save}>Save</Button></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Top Referrers</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1">User</th><th>Referrals</th><th>Earned</th></tr></thead>
            <tbody>{(o?.top_referrers ?? []).map((t: any, i: number) => (<tr key={i} className="border-t"><td className="py-1.5">{t.email}</td><td>{t.referrals}</td><td>{inr(t.earned_inr)}</td></tr>))}</tbody></table></CardContent></Card>
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Search users by email, code or transaction" value={q} onChange={(e) => { setQ(e.target.value); setP1(0); setP2(0); }} /></div>
        <Tabs defaultValue="tx"><TabsList><TabsTrigger value="tx">Commission History</TabsTrigger><TabsTrigger value="rel">Relationships</TabsTrigger></TabsList>
          <TabsContent value="tx"><Card><CardContent className="pt-4">
            <div className="flex justify-end mb-2"><Button size="sm" variant="outline" onClick={() => downloadCsv('referral-commissions.csv', comms.map((c: any) => ({ date: c.created_at, referrer: c.referrer_email, referred: c.referred_email, source: c.source, transaction: c.payment_reference, deposit_inr: c.deposit_inr, percent: c.commission_percent, commission_inr: c.commission_inr, commission_usd: c.commission_usd, status: c.status })))}><Download className="h-3.5 w-3.5" />Export CSV</Button></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2">Date</th><th>Referrer</th><th>Referred</th><th>Deposit</th><th>Commission</th><th>Transaction</th><th>Status</th></tr></thead>
              <tbody>{comms.slice(p1 * PAGE, p1 * PAGE + PAGE).map((c: any) => (<tr key={c.id} className="border-t"><td className="py-2 text-xs">{format(new Date(c.created_at), 'dd MMM yy HH:mm')}</td><td className="text-xs">{c.referrer_email}</td><td className="text-xs">{c.referred_email}</td>
                <td>{inr(c.deposit_inr)}</td><td>{Number(c.commission_percent)}% · {inr(c.commission_inr)}</td><td className="font-mono text-[11px]">{c.source} · {c.payment_reference}</td>
                <td><Badge variant={c.status === 'completed' ? 'default' : 'secondary'}>{c.status}</Badge></td></tr>))}</tbody></table></div>
            <Pager page={p1} total={comms.length} onPage={setP1} /></CardContent></Card></TabsContent>
          <TabsContent value="rel"><Card><CardContent className="pt-4 overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2">Joined</th><th>Referrer</th><th>Referred user</th><th>Code</th></tr></thead>
              <tbody>{rels.slice(p2 * PAGE, p2 * PAGE + PAGE).map((r: any, i: number) => (<tr key={i} className="border-t"><td className="py-2 text-xs">{format(new Date(r.created_at), 'dd MMM yy')}</td><td className="text-xs">{r.referrer_email}</td><td className="text-xs">{r.referred_email}</td><td className="font-mono text-xs">{r.code}</td></tr>))}</tbody></table>
            <Pager page={p2} total={rels.length} onPage={setP2} /></CardContent></Card></TabsContent></Tabs>
      </div>
    </DashboardLayout>
  );
}
