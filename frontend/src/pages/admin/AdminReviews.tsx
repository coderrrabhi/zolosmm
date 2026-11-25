import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MessageSquareQuote, Search, Check, X, Star, Trash2, Pencil, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Stars, useSignedUrls } from '@/components/reviews/ReviewImage';
import { PAGE, Pager } from '@/components/admin/AdminTablePager';

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;

export default function AdminReviews() {
  const { data = [], refetch } = useQuery({ queryKey: ['admin-reviews'], refetchInterval: 30_000, queryFn: async () => { const { data, error } = await (supabase.rpc as any)('admin_list_reviews'); if (error) throw error; return data as any[]; } });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pending'); const [q, setQ] = useState(''); const [page, setPage] = useState(0);
  const [big, setBig] = useState<string | null>(null); const [del, setDel] = useState<any>(null); const [edit, setEdit] = useState<any>(null);
  const rows = useMemo(() => data.filter((r) => (filter === 'all' || r.status === filter) && (!q || r.email?.toLowerCase().includes(q.toLowerCase()) || r.display_name?.toLowerCase().includes(q.toLowerCase()))), [data, filter, q]);
  const pageRows = rows.slice(page * PAGE, page * PAGE + PAGE);
  const { data: urls = {} } = useSignedUrls(pageRows.flatMap((r) => r.images));
  const act = async (id: string, action: string, patch: object = {}) => {
    const { error } = await (supabase.rpc as any)('admin_moderate_review', { p_id: id, p_action: action, p_patch: patch });
    if (error) return toast.error(error.message); toast.success(`Review ${action === 'feature' ? 'updated' : action + 'd'}`); refetch();
  };
  const remove = async () => {
    const r = del; setDel(null);
    if (r.images.length) await supabase.storage.from('review-images').remove(r.images);
    await act(r.id, 'delete');
  };
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === 'all' ? data.length : data.filter((r) => r.status === f).length]));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center"><MessageSquareQuote className="h-6 w-6 text-amber-600" /></div>
          <div><h1 className="text-2xl font-bold">Review Management</h1><p className="text-sm text-muted-foreground">Only approved reviews appear on the website.</p></div></div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-1 flex-wrap">{FILTERS.map((f) => (<Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => { setFilter(f); setPage(0); }} className="capitalize">{f} ({counts[f]})</Button>))}</div>
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Search by username or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {pageRows.map((r) => (<Card key={r.id}><CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2"><Stars n={r.rating} />
              <div className="flex gap-1">{r.featured && <Badge className="bg-amber-500">Featured</Badge>}<Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge></div></div>
            <p className="font-semibold">{r.title}</p><p className="text-sm text-muted-foreground whitespace-pre-line">{r.body}</p>
            <div className="flex flex-wrap gap-2">{r.images.map((p: string) => urls[p] && (<div key={p} className="relative">
              <button onClick={() => setBig(urls[p])}><img src={urls[p]} alt="Customer screenshot" className="h-20 w-20 rounded object-cover border" /></button>
              <a href={urls[p]} download target="_blank" rel="noreferrer" aria-label="Download image" className="absolute bottom-0.5 right-0.5 rounded bg-background/90 p-0.5"><Download className="h-3 w-3" /></a></div>))}</div>
            <p className="text-xs text-muted-foreground">{r.display_name} · {r.email} · {format(new Date(r.created_at), 'dd MMM yy HH:mm')}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {r.status !== 'approved' && <Button size="sm" onClick={() => act(r.id, 'approve')}><Check className="h-3.5 w-3.5" />Approve</Button>}
              {r.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => act(r.id, 'reject', { reason: window.prompt('Reason for rejection (optional)') ?? '' })}><X className="h-3.5 w-3.5" />Reject</Button>}
              <Button size="sm" variant="outline" onClick={() => act(r.id, 'feature', { featured: !r.featured })}><Star className="h-3.5 w-3.5" />{r.featured ? 'Unfeature' : 'Feature'}</Button>
              <Button size="sm" variant="outline" onClick={() => setEdit({ ...r })}><Pencil className="h-3.5 w-3.5" />Edit</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDel(r)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
            </div></CardContent></Card>))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No reviews here.</p>}
        </div>
        <Pager page={page} total={rows.length} onPage={setPage} />
      </div>
      <Dialog open={!!big} onOpenChange={(o) => !o && setBig(null)}><DialogContent className="max-w-4xl p-2">{big && <img src={big} alt="Full size screenshot" className="w-full h-auto" />}</DialogContent></Dialog>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}><DialogContent><DialogHeader><DialogTitle>Edit review</DialogTitle></DialogHeader>
        {edit && <div className="space-y-2"><Input value={edit.display_name} onChange={(e) => setEdit({ ...edit, display_name: e.target.value })} />
          <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
          <Textarea rows={5} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
          <Input type="number" min={1} max={5} value={edit.rating} onChange={(e) => setEdit({ ...edit, rating: Number(e.target.value) })} /></div>}
        <DialogFooter><Button onClick={async () => { const e = edit; setEdit(null); await act(e.id, 'edit', { display_name: e.display_name, title: e.title, body: e.body, rating: e.rating }); }}>Save</Button></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this review?</AlertDialogTitle>
        <AlertDialogDescription>The review and its screenshots will be permanently removed. This is recorded in the moderation log.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </DashboardLayout>
  );
}
