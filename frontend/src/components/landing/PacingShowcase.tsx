import { useMemo, useState } from 'react';

type Platform = {
  key: string; icon: string; label: string; color: string; bestFor: string; desc: string;
  rec: string; detail: string; warm: number; peak: number; pts: number[];
};

// Each platform has its own normalised cumulative curve (0..1 at 7 points) and phase split.
const PLATFORMS: Platform[] = [
  { key: 'organic', icon: '🌅', label: 'Organic', color: '#a855f7', bestFor: 'Standard viral reels & organic growth', desc: 'Mimics a typical viral trajectory where views build up slowly, peak, and then decay naturally.', rec: '24h - 168h (1-7 days)', detail: 'Warmup: 4h · Peak: 8h. Ideal for natural algorithmic growth.', warm: 0.2, peak: 0.67, pts: [0.02, 0.05, 0.18, 0.45, 0.78, 0.92, 0.97] },
  { key: 'universal', icon: '🌍', label: 'Universal', color: '#6366f1', bestFor: 'Any post, any niche', desc: 'Balanced linear pacing that works for every type of content without big spikes.', rec: '12h - 72h', detail: 'Warmup: 3h · Peak: 12h. Even, steady flow.', warm: 0.15, peak: 0.7, pts: [0.02, 0.17, 0.33, 0.5, 0.66, 0.83, 0.98] },
  { key: 'whop', icon: '💳', label: 'Whop', color: '#10b981', bestFor: 'Whop membership drops & product launches', desc: 'Optimized for midday commerce traffic. Provides a sustained high-volume plateau during active shopping hours.', rec: '24h - 48h', detail: 'Warmup: 5h · Peak: 10h. Sustained plateau to match drop events.', warm: 0.21, peak: 0.67, pts: [0.03, 0.1, 0.27, 0.42, 0.62, 0.78, 0.9] },
  { key: 'clipstake', icon: '🎲', label: 'Clipstake', color: '#f59e0b', bestFor: 'Clip campaigns paid per view', desc: 'Fast front-loaded start so clips qualify early, then a smooth taper.', rec: '12h - 48h', detail: 'Warmup: 2h · Peak: 6h. Early qualifying volume.', warm: 0.1, peak: 0.45, pts: [0.05, 0.4, 0.65, 0.8, 0.9, 0.95, 0.99] },
  { key: 'clipster', icon: '⭐', label: 'Clipster', color: '#eab308', bestFor: 'Short clip creators', desc: 'Two gentle waves that look like shares from different audiences.', rec: '24h - 72h', detail: 'Warmup: 3h · Peak: 2 waves. Natural share bursts.', warm: 0.15, peak: 0.75, pts: [0.02, 0.25, 0.38, 0.45, 0.7, 0.85, 0.96] },
  { key: 'picsart', icon: '🎨', label: 'Picsart', color: '#ec4899', bestFor: 'Picsart designers & creative portfolios', desc: 'Tailored to creative traffic, peaking in the afternoon with dynamic engagement pacing matching peak creative hours.', rec: '24h - 72h', detail: 'Warmup: 4h · Peak: 8h. Designed for designer portfolios.', warm: 0.2, peak: 0.67, pts: [0.03, 0.18, 0.33, 0.37, 0.55, 0.78, 0.88] },
  { key: 'crosswave', icon: '🌊', label: 'Crosswave', color: '#0ea5e9', bestFor: 'Cross-posting on many platforms', desc: 'Rolling waves that keep each repost alive longer.', rec: '48h - 168h', detail: 'Warmup: 6h · Peak: rolling. Multi-platform reach.', warm: 0.12, peak: 0.8, pts: [0.02, 0.2, 0.3, 0.5, 0.6, 0.8, 0.95] },
  { key: 'vyro', icon: '⚡', label: 'Vyro', color: '#ef4444', bestFor: 'Fast trend-jacking posts', desc: 'Explosive start to ride a trend while it is hot.', rec: '6h - 24h', detail: 'Warmup: 1h · Peak: 4h. Maximum early speed.', warm: 0.05, peak: 0.35, pts: [0.08, 0.55, 0.78, 0.88, 0.94, 0.97, 0.99] },
  { key: 'clipping', icon: '📜', label: 'Clipping.net', color: '#8b5cf6', bestFor: 'Clipping agencies', desc: 'Slow steady build that stays under platform radar.', rec: '48h - 168h', detail: 'Warmup: 8h · Peak: 24h. Low-risk drip.', warm: 0.25, peak: 0.75, pts: [0.01, 0.06, 0.15, 0.3, 0.5, 0.72, 0.93] },
  { key: 'rewards', icon: '🏆', label: 'Content Rewards', color: '#f97316', bestFor: 'Reward / bounty campaigns', desc: 'Hits milestone counts on time for payout checks.', rec: '24h - 72h', detail: 'Warmup: 3h · Peak: 10h. Milestone-paced.', warm: 0.15, peak: 0.6, pts: [0.03, 0.2, 0.42, 0.62, 0.8, 0.92, 0.98] },
  { key: 'promote', icon: '🚀', label: 'Promote.fun', color: '#14b8a6', bestFor: 'Promo pushes & giveaways', desc: 'Strong launch burst followed by a long natural tail.', rec: '12h - 48h', detail: 'Warmup: 2h · Peak: 5h. Launch spike.', warm: 0.1, peak: 0.4, pts: [0.06, 0.45, 0.62, 0.72, 0.82, 0.9, 0.96] },
  { key: 'affiliates', icon: '🛍️', label: 'ClipAffiliates', color: '#3b82f6', bestFor: 'Affiliate product clips', desc: 'Evening-heavy pacing when buyers scroll the most.', rec: '24h - 72h', detail: 'Warmup: 6h · Peak: 6h evening. Buyer hours.', warm: 0.3, peak: 0.75, pts: [0.02, 0.06, 0.12, 0.3, 0.62, 0.86, 0.95] },
  { key: 'overlay', icon: '🤖', label: 'Overlay AI', color: '#64748b', bestFor: 'AI-generated content', desc: 'Smooth logistic curve with small random variance.', rec: '24h - 96h', detail: 'Warmup: 4h · Peak: 12h. Smooth AI-friendly ramp.', warm: 0.18, peak: 0.7, pts: [0.02, 0.08, 0.25, 0.5, 0.75, 0.9, 0.97] },
  { key: 'genni', icon: '✨', label: 'Genni', color: '#d946ef', bestFor: 'New accounts & fresh pages', desc: 'Very gentle warm-up so new accounts grow safely.', rec: '72h - 168h', detail: 'Warmup: 12h · Peak: 36h. Safest pacing.', warm: 0.3, peak: 0.8, pts: [0.01, 0.03, 0.08, 0.2, 0.42, 0.7, 0.92] },
];

const ARCH = [
  { key: 'network', icon: '⚡', label: 'Delivery Network', title: 'High-speed timing delivery network', text: 'We deliver views and engagement through our timing network. Add funds to your wallet to start campaigns instantly.' },
  { key: 'scurve', icon: '📈', label: 'S-Curve', title: 'Natural S-curve pacing', text: 'Every order is split into many small runs that follow the selected curve, so growth looks real instead of arriving all at once.' },
  { key: 'infra', icon: '🛡️', label: 'Infrastructure', title: 'Multiple providers, automatic fallback', text: 'Runs are spread across several providers. If one is slow, the next run goes to another so your timeline stays on track.' },
  { key: 'live', icon: '👁️', label: 'Live Preview', title: 'See every run before you pay', text: 'The order page shows each run, its time and quantity. After placing, track every run live in your order history.' },
  { key: 'agency', icon: '🏢', label: 'Agencies & Scale', title: 'Built for agencies and bulk orders', text: 'Mass orders, saved bundles and API access let agencies run hundreds of posts with the same natural pacing.' },
];

const DURATIONS = [12, 24, 48, 72];

function path(pts: number[]) {
  const W = 600, H = 240, P = 20;
  const xy = pts.map((v, i) => [P + (i / (pts.length - 1)) * (W - 2 * P), H - P - v * (H - 2 * P)]);
  let d = `M${xy[0][0]},${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1], [x1, y1] = xy[i], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { d, xy, W, H, P };
}

export function PacingShowcase() {
  const [pk, setPk] = useState('organic');
  const [ak, setAk] = useState('network');
  const [hours, setHours] = useState(24);
  const p = PLATFORMS.find((x) => x.key === pk)!;
  const a = ARCH.find((x) => x.key === ak)!;
  const g = useMemo(() => path(p.pts), [p]);
  const w = Math.round(hours * p.warm), k = Math.round(hours * p.peak);
  const gid = `ps-${p.key}`;

  return (
    <section id="curves" className="zh-wrap zh-section ps">
      <h2>Interactive Pacing Showcase</h2>
      <p className="zh-sub">Select a creator platform curve below to simulate how views and engagement signals are paced over time.</p>
      <div className="ps-card">
        <div className="ps-row-head">
          <span className="ps-label">Select delivery algorithm ({PLATFORMS.length} platform curves)</span>
          <b className="ps-accent">{p.icon} {p.label} Curve</b>
        </div>
        <div className="ps-chips" role="tablist" aria-label="Platform curves">
          {PLATFORMS.map((x) => (
            <button key={x.key} role="tab" aria-selected={pk === x.key} onClick={() => setPk(x.key)} className={`ps-chip ${pk === x.key ? 'is-on' : ''}`}>
              <span aria-hidden="true">{x.icon}</span> {x.label}
            </button>
          ))}
        </div>
        <div className="ps-grid">
          <div className="ps-panel">
            <span className="ps-label">Platform architecture</span>
            <div className="ps-chips ps-chips-sm" role="tablist" aria-label="Architecture">
              {ARCH.map((x) => (
                <button key={x.key} role="tab" aria-selected={ak === x.key} onClick={() => setAk(x.key)} className={`ps-chip ${ak === x.key ? 'is-on' : ''}`}>
                  <span aria-hidden="true">{x.icon}</span> {x.label}
                </button>
              ))}
            </div>
            <h3 className="ps-title">{a.title}</h3>
            <p className="ps-text">{a.text}</p>
            <div className="ps-strategy">
              <div className="ps-row-head"><b className="ps-accent">{p.icon} {p.label} Strategy</b><span className="ps-badge">Optimal FYP Discovery</span></div>
              <p className="ps-best"><b>🎯 Best For:</b> <span className="ps-accent">{p.bestFor}</span></p>
              <p className="ps-text">{p.desc}</p>
              <div className="ps-meta"><span>⏱ Rec. Duration: {p.rec}</span><span>{p.detail}</span></div>
            </div>
            <div className="ps-duration">
              <div className="ps-row-head">
                <span className="ps-label">Pacing duration</span>
                <div className="ps-chips ps-chips-sm">
                  {DURATIONS.map((d) => <button key={d} onClick={() => setHours(d)} className={`ps-chip ${hours === d ? 'is-on' : ''}`}>{d}h</button>)}
                </div>
              </div>
              <div className="ps-slider">
                <input type="range" min={6} max={168} step={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} aria-label="Pacing duration in hours" />
                <b className="ps-accent">{hours} Hours</b>
              </div>
            </div>
          </div>
          <div className="ps-panel">
            <div className="ps-row-head"><span className="ps-label">Algorithmic spline simulation</span><b style={{ color: p.color }}>{p.label.toUpperCase()} • {hours}h</b></div>
            <svg viewBox={`0 0 ${g.W} ${g.H}`} className="ps-chart" role="img" aria-label={`${p.label} delivery curve over ${hours} hours`}>
              <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.color} stopOpacity="0.45" /><stop offset="1" stopColor={p.color} stopOpacity="0.02" /></linearGradient></defs>
              {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={g.P} x2={g.W - g.P} y1={g.P + f * (g.H - 2 * g.P)} y2={g.P + f * (g.H - 2 * g.P)} className="ps-gridline" />)}
              <path d={`${g.d} L${g.W - g.P},${g.H - g.P} L${g.P},${g.H - g.P} Z`} fill={`url(#${gid})`} />
              <path d={g.d} fill="none" stroke={p.color} strokeWidth="3.5" strokeLinecap="round" />
              {g.xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke={p.color} strokeWidth="2.5" />)}
            </svg>
            <div className="ps-axis">{[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f}>{Math.round(hours * f)}h</span>)}</div>
            <div className="ps-phases">
              <div><span>🌅 Warmup</span><b style={{ color: p.color }}>0–{w}h</b><small>Gradual Pacing</small></div>
              <div><span>⚡ Peak</span><b style={{ color: p.color }}>{w}–{k}h</b><small>High Volume</small></div>
              <div><span>🌙 Decay</span><b style={{ color: p.color }}>{k}–{hours}h</b><small>Natural Cooldown</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
