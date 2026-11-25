import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Gift, Search, Undo2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PAGE, Pager } from '@/components/admin/AdminTablePager';

export default function AdminDepositBonus() {
  const qc = useQueryClient();
  const { data: s } = useQuery({ queryKey: ['bonus-settings'], queryFn: async () => (await (supabase.from as any)('deposit_bonus_settings').select('*').eq('id', 1).single()).data });
  const { data: o, refetch } = useQuery({ queryKey: ['admin-bonus'], queryFn: async () => { const { data, error } = await (supabase.rpc as any)('admin_bonus_overview'); if (error) throw error; return data as any; } });
  const [form, setForm] = useState<any>(null);
  useEffect(() => { if (s) setForm(s); }, [s]);
  const [q, setQ] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [page, setPage] = useState(0);
  const [rev, setRev] = useState<any>(null);
  const rows = useMemo(() => (o?.rows ?? []).filter((r: any) => {
    const t = q.toLowerCase();
    if (t && !(r.email?.toLowerCase().includes(t) || r.payment_reference.toLowerCase().includes(t) || r.user_id.includes(t))) return false;
    if (from && r.created_at < from) return false; if (to && r.created_at.slice(0, 10) > to) return false; return true;
  }), [o, q, from, to]);

  const save = async () => {
    const { error } = await (supabase.rpc as any)('admin_update_reward_settings', { p: { bonus: {
      enabled: form.enabled, tier1_min_inr: Number(form.tier1_min_inr), tier1_percent: Number(form.tier1_percent),
      tier2_min_inr: Number(form.tier2_min_inr), tier2_percent: Number(form.tier2_percent) } } });
    if (error) return toast.error(error.message);
    toast.success('Bonus settings saved'); qc.invalidateQueries({ queryKey: ['bonus-settings'] }); qc.invalidateQueries({ queryKey: ['deposit-terms'] });
  };
  const reverse = async () => {
    const { error } = await (supabase.rpc as any)('admin_reverse_deposit_rewards', { p_source: rev.source, p_ref: rev.payment_reference, p_reason: 'Deposit refunded' });
    setRev(null); if (error) return toast.error(error.message); toast.success('Bonus and referral commission reversed'); refetch();
  };
  const f = (k: string) => ({ value: form?.[k] ?? '', onChange: (e: any) => setForm({ ...form, [k]: e.target.value }), type: 'number', step: '0.01' });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center"><Gift className="h-6 w-6 text-emerald-600" /></div>
          <div><h1 className="text-2xl font-bold">Deposit Bonus Management</h1><p className="text-sm text-muted-foreground">Bonus is added automatically after a verified UPI or crypto payment.</p></div></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total bonus distributed</p><p className="text-xl font-bold">₹{Number(o?.total_bonus_inr ?? 0).toLocaleString('en-IN')}</p><p className="text-xs">${Number(o?.total_bonus_usd ?? 0).toFixed(2)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Bonus transactions</p><p className="text-xl font-bold">{o?.count ?? 0}</p></CardContent></Card>
        </div>
        {form && (<Card><CardHeader className="pb-2"><CardTitle className="text-base">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3"><Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} /><span className="text-sm font-medium">{form.enabled ? 'Bonus system ON' : 'Bonus system OFF'}</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Tier 1 from (₹)</Label><Input {...f('tier1_min_inr')} /></div><div><Label>Tier 1 bonus %</Label><Input {...f('tier1_percent')} /></div>
              <div><Label>Tier 2 from (₹)</Label><Input {...f('tier2_min_inr')} /></div><div><Label>Tier 2 bonus %</Label><Input {...f('tier2_percent')} /></div>
            </div>
            <Button onClick={save}>Save settings</Button>
          </CardContent></Card>)}
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Bonus Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 mb-3"><div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search email, user ID or transaction ID" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="sm:w-40" /><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="sm:w-40" /></div>
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2">Date</th><th>User</th><th>Transaction</th><th>Deposit</th><th>Bonus</th><th>Status</th><th></th></tr></thead>
              <tbody>{rows.slice(page * PAGE, page * PAGE + PAGE).map((r: any) => (<tr key={r.id} className="border-t">
                <td className="py-2 text-xs">{format(new Date(r.created_at), 'dd MMM yy HH:mm')}</td><td className="text-xs">{r.email}</td><td className="font-mono text-[11px]">{r.source} · {r.payment_reference}</td>
                <td>₹{Number(r.deposit_inr).toLocaleString('en-IN')}</td><td>{Number(r.bonus_percent)}% · ₹{Number(r.bonus_inr)}</td>
                <td><Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>{r.status}</Badge></td>
                <td>{r.status === 'completed' && <Button size="sm" variant="ghost" onClick={() => setRev(r)}><Undo2 className="h-3.5 w-3.5" />Refund</Button>}</td></tr>))}</tbody></table></div>
            <Pager page={page} total={rows.length} onPage={setPage} />
          </CardContent></Card>
      </div>
      <AlertDialog open={!!rev} onOpenChange={(o) => !o && setRev(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reverse rewards for this deposit?</AlertDialogTitle>
        <AlertDialogDescription>Use this only when the deposit was refunded. The bonus is removed from the customer, any referral commission is taken back from the referrer and returned to the customer. Remove the deposit itself with the normal wallet tool.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={reverse}>Reverse</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </DashboardLayout>
  );
}
