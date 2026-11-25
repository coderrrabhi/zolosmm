import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageMeta } from '@/components/seo/PageMeta';
import { validateImageFile } from '@/lib/image-validate';
import { Stars, useSignedUrls } from '@/components/reviews/ReviewImage';

type Picked = { file: File; url: string; mime: string; ext: string };
const STATUS: Record<string, string> = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected' };

export default function Reviews() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<Picked[]>([]); const [progress, setProgress] = useState(0); const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: mine = [] } = useQuery({
    queryKey: ['my-reviews', user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('customer_reviews').select('*, review_images(storage_path, position)').eq('user_id', user!.id).order('created_at', { ascending: false });
      if (error) throw error; return data as any[];
    },
  });
  const { data: urls = {} } = useSignedUrls(mine.flatMap((r) => (r.review_images ?? []).map((i: any) => i.storage_path)));

  const pick = async (list: FileList | null) => {
    if (!list) return;
    const next: Picked[] = [];
    for (const f of Array.from(list)) {
      if (files.length + next.length >= 6) { toast.error('Maximum 6 images'); break; }
      const v = await validateImageFile(f);
      if (!v.ok) { toast.error(v.error); continue; }
      next.push({ file: f, url: URL.createObjectURL(f), mime: v.mime, ext: v.ext });
    }
    setFiles((p) => [...p, ...next]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async () => {
    if (!user) return;
    if (title.trim().length < 3) return toast.error('Add a title (at least 3 characters)');
    if (body.trim().length < 10) return toast.error('Write at least 10 characters');
    setBusy(true); setProgress(0);
    try {
      const paths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${user.id}/${crypto.randomUUID()}.${f.ext}`;
        const { error } = await supabase.storage.from('review-images').upload(path, f.file, { contentType: f.mime, upsert: false });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        paths.push(path); setProgress(Math.round(((i + 1) / (files.length + 1)) * 100));
      }
      const { error } = await (supabase.rpc as any)('submit_review', { p_title: title, p_body: body, p_rating: rating, p_images: paths });
      if (error) throw new Error(error.message);
      setProgress(100); toast.success('Thanks! Your review will appear after approval.');
      setTitle(''); setBody(''); setRating(5); setFiles([]);
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
    } catch (e: any) { toast.error(e?.message || 'Could not submit review'); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout>
      <PageMeta title="Reviews — ZoloSMM" description="Share your ZoloSMM results with a review and screenshots." canonicalPath="/reviews" />
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        <div><h1 className="text-2xl font-extrabold">Reviews</h1><p className="text-sm text-muted-foreground">Share your experience and result screenshots. Reviews go live after a quick check.</p></div>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Submit Review</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setRating(n)}><Star className={`h-7 w-7 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>))}</div>
            <Input placeholder="Review title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Tell others about your results…" maxLength={2000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (<div key={f.url} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                <img src={f.url} alt="Selected screenshot" className="h-full w-full object-cover" />
                <button aria-label="Remove image" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5"><X className="h-3 w-3" /></button></div>))}
              {files.length < 6 && (<button onClick={() => inputRef.current?.click()} className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground"><ImagePlus className="h-5 w-5" />Add image</button>)}
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => pick(e.target.files)} />
            </div>
            <p className="text-[11px] text-muted-foreground">JPG, PNG or WEBP · max 5 MB each · up to 6 images</p>
            {busy && <Progress value={progress} />}
            <Button onClick={submit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Submit Review</Button>
          </CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">My Reviews</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mine.length === 0 && <p className="text-sm text-muted-foreground">You haven't submitted a review yet.</p>}
            {mine.map((r) => (<div key={r.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center justify-between gap-2"><Stars n={r.rating} /><Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>{STATUS[r.status]}</Badge></div>
              <p className="font-semibold">{r.title}</p><p className="text-sm text-muted-foreground whitespace-pre-line">{r.body}</p>
              {r.status === 'rejected' && r.rejection_reason && <p className="text-xs text-destructive">Reason: {r.rejection_reason}</p>}
              <div className="flex gap-2">{(r.review_images ?? []).map((i: any) => urls[i.storage_path] && <img key={i.storage_path} src={urls[i.storage_path]} alt="Your screenshot" className="h-14 w-14 rounded object-cover border" />)}</div>
              <p className="text-[11px] text-muted-foreground">{format(new Date(r.created_at), 'dd MMM yyyy, HH:mm')}</p></div>))}
          </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
