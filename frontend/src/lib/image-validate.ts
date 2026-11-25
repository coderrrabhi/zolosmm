export const REVIEW_MAX_BYTES = 5 * 1024 * 1024;
const SIGS: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/webp', ext: 'webp', test: (b) => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP' },
];
/** Detect the real image type from file bytes (not the extension). */
export function sniffImage(bytes: Uint8Array) { return SIGS.find((s) => s.test(bytes)) ?? null; }
export async function validateImageFile(f: File) {
  if (f.size > REVIEW_MAX_BYTES) return { ok: false as const, error: `${f.name}: larger than 5 MB` };
  const head = new Uint8Array(await f.slice(0, 16).arrayBuffer());
  const t = sniffImage(head);
  if (!t) return { ok: false as const, error: `${f.name}: only real JPG, PNG or WEBP images are allowed` };
  return { ok: true as const, mime: t.mime, ext: t.ext };
}
