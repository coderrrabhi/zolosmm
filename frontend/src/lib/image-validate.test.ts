import { describe, it, expect } from 'vitest';
import { sniffImage } from './image-validate';
const b = (...n: number[]) => new Uint8Array([...n, ...new Array(16).fill(0)]);
describe('review image validation', () => {
  it('accepts real PNG bytes', () => expect(sniffImage(b(0x89, 0x50, 0x4e, 0x47))?.mime).toBe('image/png'));
  it('accepts real JPEG bytes', () => expect(sniffImage(b(0xff, 0xd8, 0xff))?.mime).toBe('image/jpeg'));
  it('accepts real WEBP bytes', () => expect(sniffImage(new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80]))?.mime).toBe('image/webp'));
  it('rejects a renamed text/HTML file', () => expect(sniffImage(new TextEncoder().encode('<html><script>'))).toBeNull());
  it('rejects GIF', () => expect(sniffImage(new TextEncoder().encode('GIF89a......'))).toBeNull());
});
