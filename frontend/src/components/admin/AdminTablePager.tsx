import { Button } from '@/components/ui/button';
export const PAGE = 25;
export function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE));
  return (<div className="flex items-center justify-end gap-2 pt-3 text-xs">
    <span className="text-muted-foreground">{total} rows · page {page + 1}/{pages}</span>
    <Button size="sm" variant="outline" disabled={page === 0} onClick={() => onPage(page - 1)}>Prev</Button>
    <Button size="sm" variant="outline" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Next</Button></div>);
}
export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; a.click();
}
