import React, { useEffect, useRef } from "react";
import { isGateLocked, lockGateFor, extendGate } from "./scrollGate";
import { useNavVisibility } from "./useNavVisibility";

// ── Frame map ──────────────────────────────────────────────────────────────
const FRAMES: Record<number, string> = {
   1: "/mascot/frame_1_smile.png",
   2: "/mascot/frame_2_tongue.png",
   3: "/mascot/frame_3_grin.png",
   4: "/mascot/frame_4_smirk.png",
   5: "/mascot/frame_5_neutral.png",
   6: "/mascot/frame_6_dizzy.png",
   7: "/mascot/frame_7_knockout.png",
   8: "/mascot/frame_8_quirk.png",
   9: "/mascot/frame_9_donut.png",
  10: "/mascot/frame_10_whistle.png",
  11: "/mascot/frame_11_open_eyes.png",
  12: "/mascot/frame_12_blink.png",
  13: "/mascot/frame_13_half_blink.png",
};

// ── Animation sequence ─────────────────────────────────────────────────────
const SEQUENCE: { n: number; ms: number }[] = [
  { n: 11, ms: 800  },
  { n: 12, ms: 110  },
  { n: 13, ms: 130  },
  { n: 12, ms: 110  },
  { n: 13, ms: 150  },
  { n:  3, ms: 600  },
  { n:  9, ms: 1200 },
  { n: 10, ms: 750  },
  { n:  8, ms: 420  },
  { n:  4, ms: 420  },
  { n:  8, ms: 420  },
  { n:  4, ms: 420  },
  { n:  5, ms: 600  },
  { n:  4, ms: 380  },
  { n:  1, ms: 720  },
  { n:  2, ms: 820  },
  { n:  3, ms: 600  },
];

// The headline reads "<word> [mascot] DESIGNER". The word on the left rolls through the
// disciplines one at a time and stops on the last one; DESIGNER on the right never changes.
const HERO_LEFT = ["Graphic", "UI", "UX", "Brand", "Packaging", "Editorial", "Interaction"];
const HERO_RIGHT = "Designer";
const HERO_LAST_IDX = HERO_LEFT.length - 1;
const HERO_ROLL_MS = 220;                          // how long one word takes to roll up into place
const hero_hold = (k: number) => 300 + 320 * Math.pow(k / HERO_LAST_IDX, 2); // 300ms at the start, easing to 620ms
const HERO_REEL_MASK = "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const HeroSpacer: React.FC = () => (
  <div style={{ height: "100vh", pointerEvents: "none", flexShrink: 0 }} aria-hidden="true" />
);

interface MascotHeroProps {
  isHome: boolean;
  onHome: () => void;
  onIntroRevealed?: () => void;
  // True while pinned on the Selected Works section — mascot hides there too,
  // in lockstep with the nav, regardless of scroll direction.
  forceHidden?: boolean;
  // True from the Selected Works strip down — the mascot stays visible there too, even after scrolling down.
  forceShown?: boolean;
}

export const MascotHero: React.FC<MascotHeroProps> = ({ isHome, onHome, onIntroRevealed, forceHidden, forceShown }) => {
  const onIntroRevealedRef = useRef(onIntroRevealed);
  onIntroRevealedRef.current = onIntroRevealed;
  const isHomeRef = useRef(isHome);
  isHomeRef.current = isHome;

  // Same scroll-direction signal the nav uses — mascot hides/shows in lockstep with it.
  const scrollHidden = useNavVisibility();
  const navHidden = forceHidden || (scrollHidden && !forceShown);
  const forceHiddenRef = useRef(forceHidden);
  forceHiddenRef.current = forceHidden;

  // DOM refs — all animation is done imperatively for 60fps without re-renders
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const tiltRef      = useRef<HTMLDivElement>(null);
  const breatheRef   = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const leftRef      = useRef<HTMLDivElement>(null); // the rolling word, left of the mascot
  const stripRef     = useRef<HTMLDivElement>(null);

  // Animation state refs
  const seqIdxRef       = useRef(0);
  const seqTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interruptedRef  = useRef(false);
  const preloaded       = useRef<Record<number, HTMLImageElement>>({});
  const curTiltX        = useRef(0);
  const curTiltY        = useRef(0);
  const tgtTiltX        = useRef(0);
  const tgtTiltY        = useRef(0);
  const rafRef          = useRef<number>(0);
  const progressRef     = useRef(0); // 0 = hero, 1 = corner

  // ── Preload all frames ───────────────────────────────────────────
  useEffect(() => {
    Object.entries(FRAMES).forEach(([num, src]) => {
      const img = new window.Image();
      img.src = src;
      preloaded.current[Number(num)] = img;
    });
  }, []);

  // ── Frame switcher (hard-cut, rAF-synced) ───────────────────────
  function showFrame(n: number) {
    if (!FRAMES[n] || !imgRef.current) return;
    requestAnimationFrame(() => {
      if (imgRef.current) imgRef.current.src = preloaded.current[n]?.src ?? FRAMES[n];
    });
  }

  // ── Sequence loop ────────────────────────────────────────────────
  function tick() {
    if (interruptedRef.current) return;
    const step = SEQUENCE[seqIdxRef.current];
    showFrame(step.n);
    seqIdxRef.current = (seqIdxRef.current + 1) % SEQUENCE.length;
    seqTimerRef.current = setTimeout(tick, step.ms);
  }

  // ── Click reaction: 06 → 07 → resume ────────────────────────────
  function handleClick() {
    if (interruptedRef.current) return;
    interruptedRef.current = true;
    if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
    showFrame(6);
    if (breatheRef.current) breatheRef.current.setAttribute("data-state", "dizzy");
    setTimeout(() => {
      showFrame(7);
      if (breatheRef.current) breatheRef.current.setAttribute("data-state", "knockout");
      setTimeout(() => {
        if (breatheRef.current) breatheRef.current.removeAttribute("data-state");
        interruptedRef.current = false;
        tick();
      }, 900);
    }, 700);
  }

  // ── Scroll-driven: hero → corner ────────────────────────────────
  useEffect(() => {
    const SCROLL_DIST = 450; // px to fully shrink into corner
    const SMOOTH = 0.18;     // per-frame catch-up toward the scroll position (~580ms to settle)
    let targetRaw = 0;
    let shownRaw  = 0;
    let stageTarget = 0;
    let stageShown  = 0;
    let frame     = 0;

    // Text metrics, in em.
    //   emMax    width of the widest word on either side (the font size has to fit this)
    //   capOffset how far the middle of the capital letters sits below the middle of the text box
    let emMax = 5.7, emLeftFinal = 5.7, emRight = 4.6, capOffset = 0, capEm = 0.72;
    let cornerVis = 1; // 1 while the mascot is allowed to sit in the corner, eases to 0 when it is hidden on purpose
    function measureText() {
      const t = textRef.current;
      if (!t) return;
      const fam = getComputedStyle(t).fontFamily;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `500 100px ${fam}`;
      // Widths come from a hidden copy of the real text (same classes, so the same font, caps and
      // tracking), measured at 100px.
      const probe = document.createElement("span");
      probe.className = t.className;
      probe.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;opacity:1";
      document.body.appendChild(probe);
      const wt = (s: string) => { probe.textContent = s; return probe.getBoundingClientRect().width / 100; };
      emRight = wt(HERO_RIGHT);
      emLeftFinal = wt(HERO_LEFT[HERO_LAST_IDX]);
      emMax = Math.max(emRight, ...HERO_LEFT.map(wt));
      probe.remove();
      const m = ctx.measureText("H");
      if (m.fontBoundingBoxAscent !== undefined) {
        const baseline = (100 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
        capOffset = (baseline - m.actualBoundingBoxAscent / 2 - 50) / 100;
        capEm = m.actualBoundingBoxAscent / 100; // height of a capital letter, in em
      }
    }
    measureText();
    document.fonts?.ready.then(() => { measureText(); layout(); });

    // One-time entrance: mascot rises up into place as the loader lifts away
    const ENTRANCE_MS = 1200; // matches the loader's slide-up
    const entranceStart = performance.now();
    function entranceOffset() {
      const t = Math.min(1, (performance.now() - entranceStart) / ENTRANCE_MS);
      const eased = easeInOutCubic(t); // same feel as the loader's curve
      return (1 - eased) * 420; // px below resting position, eases to 0
    }

    // ── Footer ──────────────────────────────────────────────────────────────────────────────────
    // When the page has been carried all the way down to the footer, the mascot leaves its corner,
    // hops onto the dot of the "i" in the footer logotype, bounces up off it, and settles just after
    // the word. Scrolling away sends it straight back to the corner.
    const FOOT_HOP_MS = 750;     // corner -> the dot
    const FOOT_BOUNCE_MS = 700;  // one bounce on the dot
    const FOOT_SETTLE_MS = 750;  // dot -> after the word
    const DOT_U = 0.982, DOT_V = 0.085; // where the dot sits on the logotype (fraction of its width / height)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let fActive = false, fStart = 0, fLeaveAt = 0, fWeight = 0;
    let fFrom = { cx: 0, b: 0 };                                   // art centre-x and bottom when it set off
    let fLast = { dx: 0, dy: 0, sx: 1, sy: 1 };                    // the last transform the footer path produced
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    // a damped wobble after each landing: squashes the mascot flat, then stretches it back
    const landing = (dt: number) => (dt >= 0 && dt < 600 ? Math.exp(-dt / 110) * Math.cos(dt / 45) * 0.17 : 0);

    function footerFrame(BIG: number, sF: number, startX: number, startY: number, dxN: number, dyN: number, sN: number, p: number, cw: number) {
      const logo = document.querySelector<HTMLElement>("[data-footer-logo]");
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      const want = isHomeRef.current && !!logo && maxY > 40 && window.scrollY >= maxY - 6 && p > 0.98;
      const now = performance.now();
      if (want && !fActive) {
        fActive = true; fStart = now;
        fFrom = { cx: startX + dxN + 0.5175 * BIG * sN, b: startY + dyN + 0.781 * BIG * sN };
      } else if (!want && fActive) {
        fActive = false; fLeaveAt = now;
      }
      if (fActive) fWeight = 1;
      else if (fWeight > 0) fWeight = Math.max(0, 1 - (now - fLeaveAt) / 450);
      if (!fActive && fWeight <= 0) return null;

      if (fActive && logo) {
        const r = logo.getBoundingClientRect();
        const artHalf = 0.2365 * BIG * sF;
        const dot = { cx: r.left + DOT_U * r.width, b: r.top + DOT_V * r.height };
        const end = { cx: Math.min(r.right + 28 + artHalf, cw - 24 - artHalf), b: r.bottom };
        const t = reduceMotion ? 1e9 : now - fStart;
        const t1 = FOOT_HOP_MS, t2 = t1 + FOOT_BOUNCE_MS, t3 = t2 + FOOT_SETTLE_MS;
        let cx: number, b: number;
        if (t < t1) {                       // hop from the corner up and onto the dot
          const u = t / t1;
          cx = lerp(fFrom.cx, dot.cx, easeQuad(u));
          b = lerp(fFrom.b, dot.b, u) - 4 * 150 * u * (1 - u);
        } else if (t < t2) {                // bounce up off the dot and back down onto it
          const v = (t - t1) / FOOT_BOUNCE_MS;
          cx = dot.cx; b = dot.b - 4 * 60 * v * (1 - v);
        } else if (t < t3) {                // hop off the dot to just after the word
          const w = (t - t2) / FOOT_SETTLE_MS;
          cx = lerp(dot.cx, end.cx, easeQuad(w));
          b = lerp(dot.b, end.b, w) - 4 * 95 * w * (1 - w);
        } else { cx = end.cx; b = end.b; }
        const amp = reduceMotion ? 0 : landing(t - t1) + landing(t - t2) + landing(t - t3);
        const sy = sF * (1 - amp), sx = sF * (1 + amp * 0.9);
        fLast = { dx: cx - startX - 0.5175 * BIG * sx, dy: b - startY - 0.781 * BIG * sy, sx, sy };
      }
      return { ...fLast, w: fActive ? 1 : easeInOutCubic(fWeight) };
    }

    function layout() {
      const el = wrapperRef.current;
      if (!el) return;

      const isDesktop = window.innerWidth >= 768;
      const BIG   = Math.min(window.innerWidth * (isDesktop ? 0.80 : 0.72), 460);
      const SMALL = isDesktop ? 170 : 120;
      const NAV_X = isDesktop ? -16 : -18;
      const NAV_Y = isDesktop ? -18 : -14;

      const startX = (window.innerWidth  - BIG) / 2;
      const startY = (window.innerHeight - BIG) / 2;

      // Fixed box at hero size; travel + shrink via GPU transform only
      el.style.width  = `${BIG}px`;
      el.style.height = `${BIG}px`;
      el.style.left   = `${startX}px`;
      el.style.top    = `${startY}px`;

      const p = easeInOutCubic(shownRaw);

      // Tell the nav how far the mascot is into its corner (0 = not there, 1 = there), so the "aarchi" logotype
      // can sit in the top-left while the corner is empty and slide right as the mascot arrives. Also 0 while the
      // mascot is hidden on purpose (the Contact page), eased so the logotype glides back instead of jumping.
      cornerVis += ((forceHiddenRef.current ? 0 : 1) - cornerVis) * 0.12;
      document.documentElement.style.setProperty("--mascot-corner", (p * cornerVis).toFixed(4));

      // The mascot art spans 28%–75% across its box and 22%–78% down it. The two words sit to its
      // right, one above the other: the rolling word on top, DESIGNER below, both left-aligned.
      // On the first scroll the mascot slides left AND shrinks until the art is exactly as tall as the
      // two lines: its top level with the top of the rolling word, its bottom with the bottom of
      // DESIGNER. Then the whole thing — mascot plus words — is centred on the page.
      const vw0 = window.innerWidth;
      const cw = document.documentElement.clientWidth; // page width without the scrollbar
      const gap = 24; // clear of the art even when the mascot tilts toward the cursor
      const LINE = 1.06; // distance between the two lines, in em
      const stackH = (LINE + capEm); // height of the two lines from cap-top to baseline, in em
      // the shrunken art is 0.473·BIG·s wide and 0.562·BIG·s tall, with s chosen so that height = stackH·wordSize
      const GROW = 1.07; // a touch taller than the two lines, evenly above and below
      const artWEm = (0.473 / 0.562) * stackH * GROW; // its width, in em of the word size
      const wordSize = Math.min(vw0 * (vw0 >= 900 ? 0.05 : 0.09), (cw - 48 - gap) / (emMax + artWEm));
      const sFinal = (stackH * wordSize * GROW) / (0.562 * BIG); // mascot scale once it has settled beside the words
      const s1 = 1 + (sFinal - 1) * stageShown;           // ...and how far along it is right now
      const scale = s1 + (SMALL / BIG - s1) * p;          // then the corner travel takes over
      // Centre on how the group LOOKS, not on its bounding box: DESIGNER is shorter than INTERACTION, which
      // leaves a gap under the long word's right end, so the average of the two line widths is used. The
      // bounding box then sits a little right of centre, which is what makes it look centred.
      const stackW = ((emLeftFinal + emRight) / 2) * wordSize;
      const balance = -(gap + stackW) / 2; // where the art's centre ends up, relative to the page centre

      // The box scales from its top-left corner, so work out where its corner has to be for the art's
      // centre to land where we want it: across at artCx, and still on the screen's middle line down.
      const artC0 = startX + 0.5175 * BIG;            // art centre before any scrolling
      // art centre once settled — but never so far right that the long word runs off the page
      const artCT = Math.min(cw / 2 + balance, cw - 24 - gap - Math.max(emLeftFinal, emRight) * wordSize - 0.2365 * BIG * sFinal);
      const artCx = artC0 + (artCT - artC0) * stageShown;
      const dxStage = artCx - startX - 0.5175 * BIG * s1;
      const dyStage = 0.5 * BIG * (1 - s1);
      const dx = dxStage * (1 - p) + (NAV_X - startX) * p;
      const dy = dyStage * (1 - p) + (NAV_Y - startY) * p + entranceOffset();
      const ft = footerFrame(BIG, SMALL / BIG, startX, startY, dx, dy, scale, p, cw);
      if (ft) {
        el.style.transform = `translate3d(${lerp(dx, ft.dx, ft.w)}px, ${lerp(dy, ft.dy, ft.w)}px, 0) scale(${lerp(scale, ft.sx, ft.w)}, ${lerp(scale, ft.sy, ft.w)})`;
      } else {
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
      }

      const lt = leftRef.current;
      const rt = textRef.current;
      if (lt && rt) {
        const opacity = String(stageShown * Math.max(0, 1 - p * 3));
        const cap = capOffset.toFixed(4);
        const slide = (1 - stageShown) * 48; // words slide out from behind the mascot
        const exit = p * 60;
        for (const el of [lt, rt]) { el.style.fontSize = `${wordSize}px`; el.style.opacity = opacity; }
        // Anchor the words to where the mascot's art actually is right now (not where it will end
        // up), so they can never overlap it while it is still sliding into place.
        const artNow = startX + dx + 0.5175 * BIG * scale;
        const artHalfNow = 0.2365 * BIG * scale;
        const left = `${artNow + artHalfNow + gap}px`;
        // The art's centre on the screen's middle line. The words float up and down in step with the
        // mascot (same timing, scaled to its current size), so their tops and bottoms stay level with it.
        const mid = startY + BIG / 2;
        for (const el of [lt, rt]) el.style.setProperty("--bob", `${(12 * scale).toFixed(2)}px`);
        const half = (LINE / 2) * wordSize; // half the distance between the two lines
        lt.style.left = rt.style.left = left;
        lt.style.right = "auto";
        lt.style.textAlign = "left";
        lt.style.top = `${mid - half}px`;
        rt.style.top = `${mid + half}px`;
        const tf = `translate3d(${-slide - exit}px, calc(-50% - ${cap}em), 0)`;
        lt.style.transform = rt.style.transform = tf;
      }

      progressRef.current = shownRaw;
    }

    function loop() {
      if (!isHomeRef.current) {
        // Any page other than Home: mascot stays parked in the corner
        if (holding) hold(false);
        stageTarget = 1;
        targetRaw = 1;
      } else {
        // Scroll position restored after mount (reload / back): skip the intro stage
        if (stageTarget === 0 && stageShown === 0 && window.scrollY > 8) {
          stageTarget = 1;
          stageShown = 1;
          hold(false);
        }
        targetRaw = stageShown > 0.98
          ? Math.min(Math.max(window.scrollY / SCROLL_DIST, 0), 1)
          : 0;
      }
      shownRaw += (targetRaw - shownRaw) * SMOOTH;
      if (Math.abs(targetRaw - shownRaw) < 0.0005) shownRaw = targetRaw;
      stageShown += (stageTarget - stageShown) * 0.2; // ~520ms to settle — was 0.07 (~1.6s), the main cause of "scroll doesn't respond"
      if (Math.abs(stageTarget - stageShown) < 0.001) {
        if (stageShown !== stageTarget) {
          // Stage just visually settled (either direction) — prime the shared grace
          // window so trailing momentum from this same gesture can't immediately
          // cascade into the NEXT stage owned by useHomeSnap/WorksStrip.
          extendGate();
        }
        stageShown = stageTarget;
        // Release the page as soon as a REAL stage transition visually settles — for BOTH
        // directions. triggeredAt > 0 excludes the trivial stageTarget===stageShown===0
        // equality that's already true at mount (without that guard this fired on the
        // first frame and released the page's initial hold before any scroll happened).
        // No extra fixed wait on top of settling — that used to add up to ~900ms of dead
        // time after the visual animation was already done; the shared scrollGate's own
        // grace window (extendGate, above) already absorbs trailing scroll momentum.
        if (holding && triggeredAt > 0) hold(false);
      }
      layout();
      frame = requestAnimationFrame(loop);
    }

    // Stage gate: at the top the page can't scroll; the first scroll input (any size)
    // only reveals "Interaction". Once it has settled, native scrolling is released.
    const html = document.documentElement;
    const prevOverflow = html.style.overflowY;
    const prevGutter   = html.style.scrollbarGutter;
    html.style.scrollbarGutter = "stable";

    let holding     = false;
    let triggeredAt = 0;

    function hold(on: boolean) {
      holding = on;
      html.style.overflowY = on ? "hidden" : "";
    }

    // The left word rolls up one word at a time, each held long enough to read (300ms, easing
    // to 620ms), and stops on the last word. At rest the strip already sits on the last word.
    let rollTimer: ReturnType<typeof setTimeout> | null = null;
    function parkStrip() {
      const strip = stripRef.current;
      if (!strip) return;
      strip.style.transition = "none";
      strip.style.transform = `translateY(-${HERO_LAST_IDX}em)`;
    }
    function stopCycle() {
      if (rollTimer) { clearTimeout(rollTimer); rollTimer = null; }
      parkStrip();
    }
    function cycleWords() {
      const strip = stripRef.current;
      if (rollTimer) { clearTimeout(rollTimer); rollTimer = null; }
      if (!strip || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { parkStrip(); return; }
      strip.style.transition = "none";
      strip.style.transform = "translateY(0em)"; // first word
      void strip.offsetHeight;                   // commit that jump before animating
      strip.style.transition = `transform ${HERO_ROLL_MS}ms cubic-bezier(0.3, 0.9, 0.3, 1)`;
      let i = 0;
      const next = () => {
        i += 1;
        strip.style.transform = `translateY(-${i}em)`;
        rollTimer = i < HERO_LAST_IDX ? setTimeout(next, hero_hold(i)) : null;
      };
      rollTimer = setTimeout(next, hero_hold(0));
    }

    function trigger(v: number) {
      stageTarget = v;
      triggeredAt = performance.now();
      hold(true);
      lockGateFor(700); // covers the lerp-based reveal/reverse settling (~520ms) with margin
      if (v === 1) { onIntroRevealedRef.current?.(); cycleWords(); }
      else stopCycle();
    }

    function intent(down: boolean, up: boolean, ev?: WheelEvent) {
      if (!isHomeRef.current) return;
      if (isGateLocked(ev)) { extendGate(); return; } // another stage's transition owns input right now
      // A few pixels of drift off the very top (a stray native scroll) would otherwise leave the page stuck here
      // with the first scroll ignored — nudge it back to 0 instead.
      if (stageShown === stageTarget && window.scrollY > 2 && window.scrollY < 40) window.scrollTo(0, 0);
      if (stageShown !== stageTarget || window.scrollY > 2) return;
      if (stageTarget === 0 && down) trigger(1);
      else if (stageTarget === 1 && up) trigger(0);
    }

    function onWheel(e: WheelEvent) { intent(e.deltaY > 0, e.deltaY < -20, e); }

    let touchY = 0;
    function onTouchStart(e: TouchEvent) { touchY = e.touches[0].clientY; }
    function onTouchMove(e: TouchEvent) {
      const dy = touchY - e.touches[0].clientY; // >0 = finger up = scroll down
      if (Math.abs(dy) < 6) return;
      intent(dy > 0, dy < -20);
    }

    function onKey(e: KeyboardEvent) {
      const down = ["ArrowDown", "PageDown", " ", "End"].includes(e.key);
      const up   = ["ArrowUp", "PageUp", "Home"].includes(e.key);
      if (down || up) intent(down, up);
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", layout);

    // Restored mid-page (reload): skip the intro stage.
    stageTarget = window.scrollY > 8 ? 1 : 0;
    stageShown  = stageTarget;
    targetRaw   = stageTarget ? Math.min(window.scrollY / SCROLL_DIST, 1) : 0;
    shownRaw    = targetRaw;
    hold(stageTarget === 0);
    if (stageTarget === 1) onIntroRevealedRef.current?.();
    layout();
    frame = requestAnimationFrame(loop);

    return () => {
      stopCycle();
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", layout);
      html.style.overflowY = prevOverflow;
      html.style.scrollbarGutter = prevGutter;
    };
  }, []);

  // ── 3D tilt + breathe render loop ───────────────────────────────
  useEffect(() => {
    tick();

    function animateTilt() {
      const LERP = 0.09;
      // Fade out tilt as mascot approaches corner
      const tiltScale = Math.max(0, 1 - progressRef.current * 2.5);
      curTiltX.current += (tgtTiltX.current * tiltScale - curTiltX.current) * LERP;
      curTiltY.current += (tgtTiltY.current * tiltScale - curTiltY.current) * LERP;
      if (tiltRef.current) {
        tiltRef.current.style.transform =
          `rotateX(${curTiltX.current.toFixed(3)}deg) rotateY(${curTiltY.current.toFixed(3)}deg)`;
      }
      rafRef.current = requestAnimationFrame(animateTilt);
    }
    rafRef.current = requestAnimationFrame(animateTilt);

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      tgtTiltY.current =  nx * 15;
      tgtTiltX.current = -ny * 15;
    };
    const onLeave = () => { tgtTiltX.current = 0; tgtTiltY.current = 0; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Fixed mascot — travels from center to top-left on scroll ── */}
      <div
        ref={wrapperRef}
        onClick={isHome ? handleClick : onHome}
        style={{
          position:    "fixed",
          zIndex:      45,
          cursor:      "pointer",
          perspective: "900px",
          transformOrigin: "top left",
          willChange: "transform",
          opacity: navHidden ? 0 : 1,
          pointerEvents: navHidden ? "none" : "auto",
          transition: "opacity 300ms ease-out",
        }}
      >
        {/* Tilt layer */}
        <div
          ref={tiltRef}
          style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {/* Breathe layer */}
          <div
            ref={breatheRef}
            className="mascot-breathe"
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              ref={imgRef}
              src={FRAMES[11]}
              alt="Mascot"
              draggable={false}
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
                userSelect: "none",
                filter: "drop-shadow(0 28px 48px rgba(0,0,0,0.11))",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Left of the mascot — the rolling word, appears after the first scroll ── */}
      <div
        ref={leftRef}
        aria-hidden="true"
        className="font-display font-medium tracking-tight leading-none text-ink uppercase"
        style={{
          position:      "fixed",
          zIndex:        44,
          opacity:       0,
          whiteSpace:    "nowrap",
          pointerEvents: "none",
          willChange:    "transform, opacity",
        }}
      >
        <div
          className="hero-text-bob"
          style={{
            height: "1em",
            overflow: "hidden",
            WebkitMaskImage: HERO_REEL_MASK,
            maskImage: HERO_REEL_MASK,
          }}
        >
          <div ref={stripRef} style={{ transform: `translateY(-${HERO_LAST_IDX}em)`, willChange: "transform" }}>
            {HERO_LEFT.map((w) => (
              <div key={w} style={{ height: "1em", lineHeight: "1em" }}>{w}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right of the mascot — DESIGNER, fixed ── */}
      <div
        ref={textRef}
        aria-hidden="true"
        className="font-display font-medium tracking-tight leading-none text-ink uppercase"
        style={{
          position:      "fixed",
          zIndex:        44,
          opacity:       0,
          whiteSpace:    "nowrap",
          pointerEvents: "none",
          willChange:    "transform, opacity",
        }}
      >
        <div className="hero-text-bob">{HERO_RIGHT}</div>
      </div>

      {/* ── Animation keyframes ── */}
      <style>{`
        .mascot-breathe {
          animation: mascotBreathe 3.6s ease-in-out infinite;
        }
        .mascot-breathe[data-state="dizzy"] {
          animation: mascotDizzy 0.55s ease-in-out infinite !important;
        }
        .mascot-breathe[data-state="knockout"] {
          animation: mascotKnockout 0.75s ease-in-out infinite !important;
        }
        .hero-text-bob {
          animation: heroTextBob 3.6s ease-in-out infinite;
        }
        @keyframes heroTextBob {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(calc(var(--bob, 12px) * -1)); }
        }
        @keyframes mascotBreathe {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-12px); }
        }
        @keyframes mascotDizzy {
          0%,100% { transform: rotate(0deg)  scale(1);    }
          20%     { transform: rotate(-7deg) scale(1.04); }
          40%     { transform: rotate(7deg)  scale(0.96); }
          60%     { transform: rotate(-5deg) scale(1.02); }
          80%     { transform: rotate(4deg)  scale(0.98); }
        }
        @keyframes mascotKnockout {
          0%,100% { transform: translateY(0px)  rotate(0deg);  }
          20%     { transform: translateY(14px) rotate(-5deg); }
          40%     { transform: translateY(18px) rotate(5deg);  }
          60%     { transform: translateY(10px) rotate(-3deg); }
          80%     { transform: translateY(5px)  rotate(2deg);  }
        }
      `}</style>
    </>
  );
};
