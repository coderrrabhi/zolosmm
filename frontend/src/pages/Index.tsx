import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeIndianRupee, Clock3, Gauge, Headphones, LineChart, Link as LinkIcon, Menu, Minus, Plus,
  ShieldCheck, Sparkles, Wallet, X, Zap,
} from 'lucide-react';

import { PageMeta } from '@/components/seo/PageMeta';
import './zolo-home.css';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Delivery Curves', href: '#curves' },
  { label: 'How It Works', href: '#how' },
  { label: 'FAQ', href: '#faq' },
];

const features = [
  { icon: Clock3, title: 'Human-Paced Delivery', text: 'Every order is spread out over time like real growth — no sudden spikes that look machine-made.' },
  { icon: LineChart, title: 'Natural Growth Curves', text: 'Slow start, strong middle, gentle finish. Your post grows the way a real viral post does.' },
  { icon: ShieldCheck, title: 'Safe & Private', text: 'We only need a public post link. We never ask for your password or account login.' },
  { icon: BadgeIndianRupee, title: 'Clear Wallet Pricing', text: 'Top up with UPI or USDT crypto. See the price before you order — no hidden charges.' },
];

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Telegram', 'Twitter / X', 'Instagram Reels', 'YouTube Shorts'];

const highlights = [
  { value: '24/7', label: 'Live Order Tracking', text: 'Watch every order move from start to finish in your dashboard.' },
  { value: 'UPI + USDT', label: 'Instant Wallet Top-up', text: 'Pay with any UPI app or crypto and your balance updates automatically.' },
  { value: 'API v2', label: 'Reseller Ready', text: 'Connect your own panel with our standard reseller API in minutes.' },
];

const curves = {
  organic: { label: 'Organic', note: 'Slow start, steady peak, soft finish — best for everyday posts.', pts: [0, 4, 14, 38, 66, 86, 96, 100] },
  viral: { label: 'Viral Push', note: 'Faster rise in the first hours to help new posts get noticed.', pts: [0, 12, 40, 70, 88, 95, 98, 100] },
  steady: { label: 'Steady Drip', note: 'Even, gentle delivery across the whole time window.', pts: [0, 14, 28, 43, 57, 71, 86, 100] },
} as const;
type CurveKey = keyof typeof curves;
const durations = [12, 24, 48, 72];

const steps = [
  { icon: Sparkles, title: 'Create your free account', text: 'Sign up in seconds with just your email.' },
  { icon: Wallet, title: 'Add balance', text: 'Top up your wallet with UPI or USDT crypto.' },
  { icon: LinkIcon, title: 'Paste your post link', text: 'Pick a service or a full engagement bundle.' },
  { icon: Gauge, title: 'Watch it grow', text: 'Delivery runs at a natural pace — track it live.' },
];

const faqs = [
  {
    q: 'How is this different from a normal SMM panel?',
    a: 'Normal panels resell bot numbers. We run real organic engagement — creator clipping and genuine accounts interacting with your content, delivered at human speed.',
  },
  {
    q: 'Is the engagement really organic?',
    a: 'Yes. Reach comes from real audiences and creator-led distribution. No bot bursts, no fake spikes, nothing that looks machine-made on your profile.',
  },
  {
    q: 'How do I start a campaign?',
    a: 'Add funds, paste your content link, pick the engagement type and volume, and launch. Progress updates live in your dashboard.',
  },
  {
    q: 'Is it safe for my account?',
    a: 'It is built to be. Delivery is spread naturally over time so platforms see normal growth, not a sudden unnatural jump.',
  },
  {
    q: 'How fast does it start?',
    a: 'Most campaigns begin within minutes. Bigger volumes are paced over hours or days so the growth stays organic.',
  },
  {
    q: 'Which payment methods do you support?',
    a: 'You can top up your wallet with UPI and popular payment options — balance is only used for campaigns you launch.',
  },
];

function CurveChart({ pts }: { pts: readonly number[] }) {
  const path = useMemo(() => {
    const w = 600, h = 220;
    const xy = pts.map((p, i) => [(i / (pts.length - 1)) * w, h - (p / 100) * (h - 20) - 10]);
    let d = `M ${xy[0][0]} ${xy[0][1]}`;
    for (let i = 1; i < xy.length; i++) {
      const [x0, y0] = xy[i - 1]; const [x1, y1] = xy[i]; const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return { d, area: `${d} L ${w} ${h} L 0 ${h} Z`, xy };
  }, [pts]);
  return (
    <svg viewBox="0 0 600 220" className="zh-chart" role="img" aria-label="Delivery curve">
      <defs>
        <linearGradient id="zhArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="zh-stop-a" /><stop offset="100%" className="zh-stop-b" />
        </linearGradient>
      </defs>
      {[55, 110, 165].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className="zh-grid" />)}
      <path d={path.area} fill="url(#zhArea)" />
      <path d={path.d} className="zh-line" />
      {path.xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" className="zh-dot" />)}
    </svg>
  );
}

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [curve, setCurve] = useState<CurveKey>('organic');
  const [hours, setHours] = useState(24);
  const c = curves[curve];

  return (
    <div className="zh">
      <PageMeta
        title="ZoloSMM — Natural-Paced Social Media Growth Panel"
        description="Grow on Instagram, YouTube, TikTok and more with human-paced delivery, live tracking, UPI & USDT wallet and a reseller API."
        canonicalPath="/"
        breadcrumbs={[{ name: 'Home', path: '/' }]}
      />

      <header className="zh-nav">
        <div className="zh-wrap zh-nav-row">
          <Link to="/" className="zh-brand" aria-label="ZoloSMM home">
            <img src="/zolo-logo.png" alt="" className="zh-logo" />
            <span>Zolo<b className="z3-grad-text">SMM</b></span>
          </Link>
          <nav className="zh-pill-nav">
            {navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <div className="zh-nav-cta">
            <Link to="/auth" className="zh-btn z3-btn-soft">Sign In</Link>
            <Link to="/auth" className="zh-btn z3-btn">Get Started</Link>
          </div>
          <button className="zh-menu z3-btn-soft" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="zh-wrap zh-mobile-menu z3-raised">
            {navLinks.map((l) => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
            <div className="zh-mobile-cta">
              <Link to="/auth" className="zh-btn z3-btn-soft">Sign In</Link>
              <Link to="/auth" className="zh-btn z3-btn">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <section className="zh-wrap zh-hero">
        <span className="zh-kicker z3-raised-sm"><i /> Natural-paced SMM panel for creators & resellers</span>
        <h1>Stop buying fake spikes.<br /><span className="z3-grad-text">Grow at a natural pace.</span></h1>
        <p>Views, likes, followers and full engagement bundles delivered slowly and steadily — the way real audiences find your content.</p>
        <div className="zh-hero-cta">
          <Link to="/auth" className="zh-btn zh-btn-lg z3-btn">Create Free Account <ArrowRight size={18} /></Link>
          <a href="#how" className="zh-btn zh-btn-lg z3-btn-soft">See How It Works</a>
        </div>

        <div id="features" className="zh-features">
          {features.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="zh-feature z3-raised">
              <span className="zh-icon z3-raised-sm"><Icon size={22} /></span>
              <div>
                <h3>{String(i + 1).padStart(2, '0')}. {title}</h3>
                <em />
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="zh-marquee" aria-label="Supported platforms">
        <p>One wallet. Every major platform.</p>
        <div className="zh-marquee-track">
          {[...platforms, ...platforms].map((p, i) => <span key={i} className="z3-raised-sm"><i />{p}</span>)}
        </div>
      </section>

      <section className="zh-wrap zh-stats">
        {highlights.map((h) => (
          <div key={h.label} className="zh-stat z3-raised">
            <strong className="z3-grad-text">{h.value}</strong>
            <h3>{h.label}</h3>
            <p>{h.text}</p>
          </div>
        ))}
      </section>

      <section id="curves" className="zh-wrap zh-section">
        <h2>See how your order is delivered</h2>
        <p className="zh-sub">Pick a delivery style and time window to preview how engagement arrives on your post.</p>
        <div className="zh-show z3-raised">
          <div className="zh-chips">
            {(Object.keys(curves) as CurveKey[]).map((k) => (
              <button key={k} onClick={() => setCurve(k)} className={`zh-chip ${curve === k ? 'z3-btn' : 'z3-btn-soft'}`}>{curves[k].label}</button>
            ))}
          </div>
          <div className="zh-show-grid">
            <div className="zh-show-info z3-raised-sm">
              <span className="zh-tag">{c.label} delivery</span>
              <h3>{c.note}</h3>
              <div className="zh-phases">
                <div className="z3-pressed"><b>Warm-up</b><span>0–{Math.round(hours * 0.2)}h</span></div>
                <div className="z3-pressed"><b>Peak</b><span>{Math.round(hours * 0.2)}–{Math.round(hours * 0.65)}h</span></div>
                <div className="z3-pressed"><b>Finish</b><span>{Math.round(hours * 0.65)}–{hours}h</span></div>
              </div>
              <div className="zh-durations">
                <span>Time window</span>
                {durations.map((d) => (
                  <button key={d} onClick={() => setHours(d)} className={`zh-chip zh-chip-sm ${hours === d ? 'z3-btn' : 'z3-btn-soft'}`}>{d}h</button>
                ))}
              </div>
            </div>
            <div className="zh-show-chart z3-raised-sm">
              <div className="zh-chart-head"><span>Delivery preview</span><b>{c.label} • {hours}h</b></div>
              <CurveChart pts={c.pts} />
              <div className="zh-axis">{[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f}>{Math.round(hours * f)}h</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="zh-wrap zh-section">
        <h2>Start in under three minutes</h2>
        <p className="zh-sub">No setup, no verification wait. Just sign up, top up and order.</p>
        <div className="zh-steps">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="zh-step z3-raised">
              <span className="zh-num z3-raised-sm">{String(i + 1).padStart(2, '0')}</span>
              <div><h3><Icon size={18} /> {title}</h3><em /><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="zh-wrap zh-section zh-faq">
        <h2>Frequently asked questions</h2>
        <p className="zh-sub">Still stuck? <Link to="/support">Open a support ticket</Link>.</p>
        <div className="zh-faq-list">
          {faqs.map((f, i) => (
            <div key={f.q} className="zh-faq-item z3-raised">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{f.q}</span>{openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
              {openFaq === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="zh-wrap zh-cta z3-raised">
        <Zap size={26} />
        <h2>Ready to grow the natural way?</h2>
        <p>Create your free ZoloSMM account and place your first order today.</p>
        <Link to="/auth" className="zh-btn zh-btn-lg z3-btn">Get Started Free <ArrowRight size={18} /></Link>
      </section>

      <footer className="zh-footer">
        <div className="zh-wrap zh-foot-grid">
          <div>
            <Link to="/" className="zh-brand"><img src="/zolo-logo.png" alt="" className="zh-logo" /><span>Zolo<b className="z3-grad-text">SMM</b></span></Link>
            <p>Natural-paced social media growth with live tracking, a simple wallet and a reseller API.</p>
          </div>
          <div><h4>Product</h4><a href="#features">Features</a><a href="#curves">Delivery Curves</a><Link to="/api-access">Reseller API</Link></div>
          <div><h4>Company</h4><Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/support"><Headphones size={14} /> Support</Link></div>
          <div><h4>Legal</h4><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refund">Refunds</Link><Link to="/cookies">Cookies</Link></div>
        </div>
        <p className="zh-copy">© {new Date().getFullYear()} ZoloSMM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
