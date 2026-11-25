import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSignedUrls(paths: string[]) {
  return useQuery({
    queryKey: ['review-img', paths], enabled: paths.length > 0, staleTime: 50 * 60_000,
    queryFn: async () => {
      const { data } = await supabase.storage.from('review-images').createSignedUrls(paths, 3600);
      return Object.fromEntries((data ?? []).map((d: any) => [d.path, d.signedUrl])) as Record<string, string>;
    },
  });
}
export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return <span className="text-amber-500" style={{ fontSize: size }} aria-label={`${n} out of 5 stars`}>{'★'.repeat(n)}<span className="text-slate-300">{'★'.repeat(5 - n)}</span></span>;
}
