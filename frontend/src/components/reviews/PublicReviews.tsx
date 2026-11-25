import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Stars, useSignedUrls } from './ReviewImage';

export function PublicReviews() {
  const { data = [] } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => { const { data, error } = await (supabase.rpc as any)('get_public_reviews', { p_limit: 12 }); if (error) throw error; return data as any[]; },
  });
  const paths = data.flatMap((r) => r.images as string[]);
  const { data: urls = {} } = useSignedUrls(paths);
  const [open, setOpen] = useState<string | null>(null);
  if (data.length === 0) return null;
  return (
    <section id="reviews" className="zh-wrap zh-section">
      <h2 style={{ textAlign: 'center' }}>What our customers say</h2>
      <p className="zh-sub" style={{ textAlign: 'center' }}>Real reviews and result screenshots from verified customers.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {data.map((r) => (
          <article key={r.id} className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between"><Stars n={r.rating} />{r.featured && <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Featured</span>}</div>
            <h3 className="font-bold text-slate-900">{r.title}</h3>
            <p className="text-sm text-slate-600 whitespace-pre-line">{r.body}</p>
            {r.images.length > 0 && (<div className="grid grid-cols-3 gap-2 mt-1">{r.images.map((p: string) => urls[p] && (
              <button key={p} onClick={() => setOpen(urls[p])} className="aspect-square overflow-hidden rounded-lg border"><img src={urls[p]} alt={`Screenshot from ${r.display_name}`} loading="lazy" className="h-full w-full object-cover" /></button>))}</div>)}
            <p className="mt-auto pt-2 text-xs text-slate-500">— {r.display_name} · {format(new Date(r.created_at), 'dd MMM yyyy')}</p>
          </article>))}
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}><DialogContent className="max-w-3xl p-2">{open && <img src={open} alt="Review screenshot" className="w-full h-auto rounded" />}</DialogContent></Dialog>
    </section>
  );
}
