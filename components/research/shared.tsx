import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ── Evidence linking: the insights light up the findings behind them ──
interface EvidenceState {
  active: number | null; // the insight currently lighting things up (hover or pinned)
  pinned: number | null;
  hoverInsight: (n: number | null) => void;
  togglePin: (n: number) => void;
  clearPin: () => void;
  jump: (insight: number, chapter: string, key: string) => void;
  jumpKey: { key: string; t: number } | null;
  personaFocus: string | null;
  setPersonaFocus: (k: string | null) => void;
}

const Ctx = createContext<EvidenceState | null>(null);

export const EvidenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [jumpKey, setJumpKey] = useState<{ key: string; t: number } | null>(null);
  const [personaFocus, setPersonaFocus] = useState<string | null>(null);

  const jump = useCallback((insight: number, chapter: string, key: string) => {
    setPinned(insight);
    setJumpKey({ key, t: Date.now() });
    window.setTimeout(() => document.getElementById(chapter)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []);

  const value: EvidenceState = {
    active: pinned ?? hovered,
    pinned,
    hoverInsight: setHovered,
    togglePin: (n) => setPinned((p) => (p === n ? null : n)),
    clearPin: () => setPinned(null),
    jump,
    jumpKey,
    personaFocus,
    setPersonaFocus,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useEvidence = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useEvidence must be used inside EvidenceProvider');
  return c;
};

// run `cb` whenever an insight asks to jump to `key`
export const useJump = (key: string | string[], cb: () => void) => {
  const { jumpKey } = useEvidence();
  const keys = Array.isArray(key) ? key : [key];
  const last = useRef(0);
  useEffect(() => {
    if (jumpKey && keys.includes(jumpKey.key) && jumpKey.t !== last.current) { last.current = jumpKey.t; cb(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpKey]);
};

export const glowClass = 'ring-2 ring-cobalt bg-cobalt/5';

// ── Small hooks ──────────────────────────────────────────────────
export const useInViewOnce = <T extends HTMLElement>(threshold = 0.3) => {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
};

export const useCountUp = (target: number, start: boolean, ms = 1400) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, ms]);
  return v;
};

// ── Chapter wrapper ──────────────────────────────────────────────
export const Chapter: React.FC<{ id: string; n: string; kicker: string; title: string; intro?: string; children: React.ReactNode }> = ({ id, n, kicker, title, intro, children }) => (
  <div id={id} className="scroll-mt-8 mb-28 md:mb-36">
    <h3 className="font-display font-normal text-lg tracking-wide leading-[1.1] mb-4 pb-3 border-b border-cobalt/25 text-cobalt">{title}</h3>
    {intro && <p className="font-sans text-lg mb-10 leading-relaxed">{intro}</p>}
    {children}
  </div>
);

export const tile = 'bg-paper rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)]';
export const labelCls = 'font-sans text-[11px] tracking-wide';
