import React, { useEffect, useRef } from "react";
import { extendGate } from "./scrollGate";
import { useNavVisibility } from "./useNavVisibility";

// ── Main values — everything you are likely to want to tweak is in this one block ───────────────
export const HERO = {
  showCharacter: true,  // false hides the drawing (and its click area); the words and intro line stay where they are
  artVhDesktop: 0.46,   // character height as a share of the viewport height (desktop)
  artVhMobile: 0.30,    // ...and on a phone
  wordVw: 0.04,         // size of the big rolling words, as a share of the viewport width
  introMaxPx: 680,      // widest the intro paragraph gets on desktop (it is as wide as this, or as the room beside the character if that is less)
  eyeRangeX: 6,         // how far the pupils may travel sideways (in art pixels, the art is 1024 wide)
  eyeRangeY: 4,         // ...and up / down
  eyeEase: 0.14,        // 0 = never moves, 1 = jumps straight to the target. Lower = smoother, lazier eyes
  eyeFullTiltPx: 420,   // distance from the eyes at which the pupils reach the edge of their range
  flourishMinMs: 9000,  // the character pulls a quick face (grin, tongue, whistle...) every so often
  flourishMaxMs: 16000,
};

// ── Frame map ──────────────────────────────────────────────────────────────
// 0 is not one of your drawings: it is frame 11 with the two pupils painted out, so that live pupils
// (the <ellipse>s further down) can move over it.
const ATTENTIVE = 0;
const FRAMES: Record<number, string> = {
   0: "/mascot/frame_11_open_eyes_nopupil.png",
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

// Short faces she pulls now and then while she is otherwise just watching you.
const FLOURISHES: { n: number; ms: number }[][] = [
  [{ n: 3, ms: 900 }],                                                                       // grin
  [{ n: 1, ms: 700 }, { n: 2, ms: 900 }],                                                    // smile, tongue
  [{ n: 9, ms: 1000 }, { n: 10, ms: 800 }],                                                  // donut, whistle
  [{ n: 8, ms: 420 }, { n: 4, ms: 420 }, { n: 8, ms: 420 }, { n: 4, ms: 500 }],              // quirk / smirk
];

// Where the two pupils sit in frame 11, in the art's own 1024 x 1024 pixels.
const EYES = [{ x: 441, y: 489 }, { x: 555, y: 490 }];
const EYE_CENTER_Y = 492; // the middle of the eyes, for working out which way to look

// The headline reads "<word> [mascot] DESIGNER". The word on the left rolls through the
// disciplines one at a time and stops on the last one; DESIGNER on the right never changes.
const HERO_LEFT = ["Graphic", "UI", "UX", "Brand", "Packaging", "Editorial", "Interaction"];
const HERO_RIGHT = "Designer";
const HERO_LAST_IDX = HERO_LEFT.length - 1;
const HERO_ROLL_MS = 220;                          // how long one word takes to roll up into place
const hero_hold = (k: number) => 300 + 320 * Math.pow(k / HERO_LAST_IDX, 2); // 300ms at the start, easing to 620ms
const HERO_REEL_MASK = "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)";

const INTRO = "Hi, I'm Aarchi - a brand & interaction designer. I turn messy problems into experiences people get right away. Find me a problem worth solving, put my music on, and I disappear until it's done.";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// The works strip starts one screen down; this is the screen the hero lives on.
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
  const pupilsRef    = useRef<SVGSVGElement>(null);
  const pupilL       = useRef<SVGEllipseElement>(null);
  const pupilR       = useRef<SVGEllipseElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const leftRef      = useRef<HTMLDivElement>(null); // the rolling word, left of the mascot
  const stripRef     = useRef<HTMLDivElement>(null);
  const introRef     = useRef<HTMLParagraphElement>(null);

  // Animation state refs
  const seqTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flourishRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interruptedRef  = useRef(false);
  const preloaded       = useRef<Record<number, HTMLImageElement>>({});
  const curTiltX        = useRef(0);
  const curTiltY        = useRef(0);
  const tgtTiltX        = useRef(0);
  const tgtTiltY        = useRef(0);
  const rafRef          = useRef<number>(0);
  const progressRef     = useRef(0); // 0 = hero, 1 = corner
  const reduceMotionRef = useRef(false);

  // ── Preload all frames ───────────────────────────────────────────
  useEffect(() => {
    Object.entries(FRAMES).forEach(([num, src]) => {
      const img = new window.Image();
      img.src = src;
      preloaded.current[Number(num)] = img;
    });
  }, []);

  // ── Frame switcher (hard-cut, rAF-synced) ───────────────────────
  // The live pupils only make sense on frame 0; every other frame has its own eyes drawn in.
  function showFrame(n: number) {
    if (!FRAMES[n] || !imgRef.current) return;
    requestAnimationFrame(() => {
      if (imgRef.current) imgRef.current.src = preloaded.current[n]?.src ?? FRAMES[n];
      if (pupilsRef.current) pupilsRef.current.style.opacity = n === ATTENTIVE ? "1" : "0";
    });
  }

  // ── Flourishes: every so often she pulls a quick face, then goes back to watching you ──
  function scheduleFlourish() {
    if (reduceMotionRef.current) return;
    if (flourishRef.current) clearTimeout(flourishRef.current);
    flourishRef.current = setTimeout(playFlourish, HERO.flourishMinMs + Math.random() * (HERO.flourishMaxMs - HERO.flourishMinMs));
  }
  function playFlourish() {
    if (interruptedRef.current) { scheduleFlourish(); return; }
    const seq = FLOURISHES[Math.floor(Math.random() * FLOURISHES.length)];
    let i = 0;
    const step = () => {
      if (interruptedRef.current) return;
      if (i < seq.length) {
        showFrame(seq[i].n);
        seqTimerRef.current = setTimeout(step, seq[i].ms);
        i += 1;
      } else {
        showFrame(ATTENTIVE);
        scheduleFlourish();
      }
    };
    step();
  }

  // ── Click reaction: 06 → 07 → back to watching ──────────────────
  function handleClick() {
    if (interruptedRef.current) return;
    interruptedRef.current = true;
    if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
    if (flourishRef.current) clearTimeout(flourishRef.current);
    showFrame(6);
    if (breatheRef.current) breatheRef.current.setAttribute("data-state", "dizzy");
    setTimeout(() => {
      showFrame(7);
      if (breatheRef.current) breatheRef.current.setAttribute("data-state", "knockout");
      setTimeout(() => {
        if (breatheRef.current) breatheRef.current.removeAttribute("data-state");
        interruptedRef.current = false;
        showFrame(ATTENTIVE);
        scheduleFlourish();
      }, 900);
    }, 700);
  }

  // ── Layout: hero → corner on scroll ──────────────────────────────
  useEffect(() => {
    const SCROLL_DIST = 450; // px to fully shrink into corner
    const SMOOTH = 0.18;     // per-frame catch-up toward the scroll position (~580ms to settle)
    let targetRaw = 0;
    let shownRaw  = 0;
    let stageTarget = 0; // 0 = the mascot is centred on its own, 1 = settled beside the words and intro
    let stageShown  = 0;
    let frame     = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reduceMotionRef.current = reduceMotion;

    // Text metrics, in em.
    //   emMax    width of the widest word on either side (the font size has to fit this)
    //   capOffset how far the middle of the capital letters sits below the middle of the text box
    let emMax = 5.7, emLeftFinal = 5.7, emRight = 4.6, capOffset = 0, capEm = 0.72;
    let cornerVis = 1; // 1 while the mascot is allowed to sit in the corner, eases to 0 when it is hidden on purpose
    let introKey = "", introH = 0; // the intro paragraph is measured only when its width or font size changes
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
    document.fonts?.ready.then(() => { measureText(); introKey = ""; layout(); });

    // One-time entrance: mascot rises up into place as the loader lifts away
    const ENTRANCE_MS = 1200; // matches the loader's slide-up
    const entranceStart = performance.now();
    function entranceOffset() {
      if (reduceMotion) return 0;
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

    // The mascot art spans 28.1%–75.4% across its box and 21.9%–78.1% down it (centre 51.75% / 50%).
    function layout() {
      const el = wrapperRef.current;
      if (!el) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cw = document.documentElement.clientWidth; // page width without the scrollbar
      const isDesktop = vw >= 768;

      // ── The first screen ─────────────────────────────────────────────────────────────────────
      // Desktop: [ big words over the intro line | character ], the words on the left and the character on the right,
      // each held in from the edge by the same side margin as the content of the other pages.
      // Phone:   character, then the big words, then the intro line, one under the other.
      const artH0 = isDesktop ? Math.min(vh * HERO.artVhDesktop, cw * 0.36) : Math.min(vh * HERO.artVhMobile, cw * 0.66); // the most height the art may take
      const artW0 = (0.473 / 0.562) * artH0;
      const SMALL = isDesktop ? 130 : 120;       // the mascot's size once it sits in the top-left corner
      const NAV_X = isDesktop ? -4.5 : -18;      // (chosen so the art's left edge and its middle line up with the logotype)
      const NAV_Y = isDesktop ? 2 : -14;
      const gap = isDesktop ? 32 : 0;            // clear of the art even when the mascot tilts toward the cursor
      const SIDE = Math.max(32, (cw - 1152) / 2); // the side margin of the page's content column (max-w-6xl), at least 32px
      const LINE = 1.06;                         // distance between the two word lines, in em
      const stackEm = LINE + capEm;              // height of the two lines from cap-top to baseline, in em
      const wordSize = isDesktop
        ? Math.min(vw * HERO.wordVw, vh * 0.12, (cw - 2 * SIDE - gap - artW0) / emMax)
        : Math.min(cw * 0.125, (cw - 48) / emMax);
      const stackPx = stackEm * wordSize;
      const colW = isDesktop ? Math.min(cw - 2 * SIDE - gap - artW0, HERO.introMaxPx) : cw - 48;   // stretched across the room left of the character
      const introFont = isDesktop ? Math.max(16, Math.min(vw * 0.0135, 21)) : 15;
      const introGap = isDesktop ? wordSize * 0.3 : 20;

      const it = introRef.current;
      if (it) {
        const key = `${Math.round(colW)}|${introFont}`;
        if (key !== introKey) {
          introKey = key;
          it.style.width = `${colW}px`;
          it.style.fontSize = `${introFont}px`;
          introH = it.offsetHeight;
        }
      }

      // The character takes the full height it is allowed, and sits level with the middle of the text block beside it.
      const artH = artH0;
      const BIG = artH / 0.562;                  // box size at which the art is artH tall
      const artW = (0.473 / 0.562) * artH;       // the art's visible width

      const startX = (vw - BIG) / 2;
      const startY = (vh - BIG) / 2;

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

      // Where the art's centre ends up, and the vertical centre of the big words (S) and the top of the intro.
      let artCxT: number, artCyT: number, S: number, introTop: number;
      if (isDesktop) {
        artCxT = cw - SIDE - artW / 2;                          // the character's right edge sits on the right margin
        artCyT = vh / 2 + 24;                                   // a little below centre: the nav takes the top
        const colH = stackPx + introGap + introH;
        S = artCyT - colH / 2 + stackPx / 2;
        introTop = S + stackPx / 2 + introGap;
      } else {
        const below = 26;                                       // clear of the hair even while she bobs
        const total = artH + below + stackPx + introGap + introH;
        const top = Math.max(88, (vh - total) / 2 + 28);
        artCxT = cw / 2;
        artCyT = top + artH / 2;
        S = top + artH + below + stackPx / 2;
        introTop = S + stackPx / 2 + introGap;
      }

      const artC0 = startX + 0.5175 * BIG;                      // art centre before the entrance settles: the screen's middle
      const cx = artC0 + (artCxT - artC0) * stageShown;
      const cy = vh / 2 + (artCyT - vh / 2) * stageShown;
      const s1 = 1;
      const scale = s1 + (SMALL / BIG - s1) * p;                // then the corner travel takes over
      const dxStage = cx - startX - 0.5175 * BIG * s1;
      const dyStage = cy - startY - 0.5 * BIG * s1;
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
        const slide = (1 - stageShown) * (isDesktop ? 48 : 24); // words slide out from behind the mascot (up from below on a phone)
        const exit = p * (isDesktop ? 60 : 40);
        for (const e of [lt, rt]) { e.style.fontSize = `${wordSize}px`; e.style.opacity = opacity; }
        // The words float up and down in step with the mascot (same timing, scaled to its current size).
        for (const e of [lt, rt]) e.style.setProperty("--bob", `${(12 * scale).toFixed(2)}px`);
        const half = (LINE / 2) * wordSize; // half the distance between the two lines
        lt.style.top = `${S - half}px`;
        rt.style.top = `${S + half}px`;
        lt.style.right = "auto";
        if (isDesktop) {
          // The words start on the left margin, and the character is on the right.
          const left = `${SIDE}px`;
          lt.style.left = rt.style.left = left;
          lt.style.textAlign = rt.style.textAlign = "left";
          lt.style.transform = rt.style.transform = `translate3d(${-slide - exit}px, calc(-50% - ${cap}em), 0)`;
          if (it) { it.style.left = left; it.style.textAlign = "left"; it.style.transform = `translate3d(${-slide - exit}px, 0, 0)`; }
        } else {
          lt.style.left = rt.style.left = `${cw / 2}px`;
          lt.style.textAlign = rt.style.textAlign = "center";
          lt.style.transform = rt.style.transform = `translate3d(-50%, calc(-50% - ${cap}em + ${slide - exit}px), 0)`;
          if (it) { it.style.left = `${cw / 2}px`; it.style.textAlign = "center"; it.style.transform = `translate3d(-50%, ${slide - exit}px, 0)`; }
        }
        if (it) { it.style.top = `${introTop}px`; it.style.opacity = opacity; }
      }

      progressRef.current = shownRaw;
    }

    function loop() {
      if (!isHomeRef.current) {
        // Any page other than Home: mascot stays parked in the corner
        stageTarget = 1;
        targetRaw = 1;
      } else {
        // Scrolling away from the top finishes the entrance on the spot, so a scroll that arrives while the words are
        // still easing in (slow frame rate, quick visitor) can never leave the mascot stranded in the middle.
        if (stageTarget === 1 && window.scrollY > 8) stageShown = 1;
        targetRaw = stageShown > 0.98
          ? Math.min(Math.max(window.scrollY / SCROLL_DIST, 0), 1)
          : 0;
      }
      shownRaw += (targetRaw - shownRaw) * SMOOTH;
      if (Math.abs(targetRaw - shownRaw) < 0.0005) shownRaw = targetRaw;
      stageShown += (stageTarget - stageShown) * 0.2; // ~520ms to settle
      if (Math.abs(stageTarget - stageShown) < 0.001) {
        if (stageShown !== stageTarget) extendGate(); // prime the shared grace window so trailing momentum can't cascade into the next stage
        stageShown = stageTarget;
      }
      layout();
      frame = requestAnimationFrame(loop);
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
      if (!strip || reduceMotion) { parkStrip(); return; }
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

    // The scrollbar gutter is reserved so the page does not jump sideways when it appears.
    const html = document.documentElement;
    const prevGutter = html.style.scrollbarGutter;
    html.style.scrollbarGutter = "stable";

    // The mascot rises into the middle, then slides left as the words and the intro line come out from behind it.
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    function reveal() {
      stageTarget = 1;
      if (reduceMotion) stageShown = 1;
      cycleWords();
      onIntroRevealedRef.current?.();
    }
    if (window.scrollY > 8 || reduceMotion) {
      stageTarget = 1; stageShown = 1;                          // restored mid-page (reload), or no motion wanted: skip the entrance
      targetRaw = Math.min(window.scrollY / SCROLL_DIST, 1);
      shownRaw = targetRaw;
      reveal();
    } else {
      revealTimer = setTimeout(reveal, 650);
    }
    window.addEventListener("resize", layout);
    layout();
    frame = requestAnimationFrame(loop);

    return () => {
      if (revealTimer) clearTimeout(revealTimer);
      stopCycle();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", layout);
      html.style.scrollbarGutter = prevGutter;
    };
  }, []);

  // ── Tilt, eyes and the first expression ─────────────────────────
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // She wakes up: eyes shut for a moment, then open and watching.
    if (reduceMotion) {
      showFrame(5);                                             // just the neutral face
    } else {
      showFrame(12);
      seqTimerRef.current = setTimeout(() => { showFrame(ATTENTIVE); scheduleFlourish(); }, 900);
    }

    let mouseX = 0, mouseY = 0, mouseSeen = false;
    let eyeX = 0, eyeY = 0; // current pupil offset, in art pixels

    function animate(now: number) {
      // Fade out tilt as mascot approaches corner
      const LERP = 0.09;
      const tiltScale = Math.max(0, 1 - progressRef.current * 2.5);
      curTiltX.current += (tgtTiltX.current * tiltScale - curTiltX.current) * LERP;
      curTiltY.current += (tgtTiltY.current * tiltScale - curTiltY.current) * LERP;
      if (tiltRef.current) {
        tiltRef.current.style.transform =
          `rotateX(${curTiltX.current.toFixed(3)}deg) rotateY(${curTiltY.current.toFixed(3)}deg)`;
      }

      // Pupils: look at the cursor, within a small range, eased. With no mouse (a phone) they drift about on their own.
      const L = pupilL.current, R = pupilR.current, w = wrapperRef.current;
      if (L && R && w && !reduceMotion) {
        let tx = 0, ty = 0;
        if (hasMouse && mouseSeen) {
          const r = w.getBoundingClientRect();
          const ex = r.left + (498 / 1024) * r.width;
          const ey = r.top + (EYE_CENTER_Y / 1024) * r.height;
          const dx = mouseX - ex, dy = mouseY - ey;
          const dist = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, dist / HERO.eyeFullTiltPx);
          tx = (dx / dist) * k * HERO.eyeRangeX;
          ty = (dy / dist) * k * HERO.eyeRangeY;
        } else if (!hasMouse) {
          const t = now / 1000;
          tx = Math.sin(t * 0.7) * HERO.eyeRangeX * 0.85;
          ty = Math.sin(t * 0.43 + 1.3) * HERO.eyeRangeY * 0.6;
        }
        eyeX += (tx - eyeX) * HERO.eyeEase;
        eyeY += (ty - eyeY) * HERO.eyeEase;
        const t = `translate(${eyeX.toFixed(2)}px, ${eyeY.toFixed(2)}px)`;
        L.style.transform = t;
        R.style.transform = t;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    // Mouse events only store the position; the rAF loop above does the work, so nothing is throttled by hand.
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY; mouseSeen = true;
      if (reduceMotion) return;
      const nx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      tgtTiltY.current =  nx * 15;
      tgtTiltX.current = -ny * 15;
    };
    const onLeave = () => { tgtTiltX.current = 0; tgtTiltY.current = 0; mouseSeen = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      if (seqTimerRef.current) clearTimeout(seqTimerRef.current);
      if (flourishRef.current) clearTimeout(flourishRef.current);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* ── Fixed mascot — centred on the first screen, travels to the top-left corner on scroll ── */}
      <div
        ref={wrapperRef}
        style={{
          position:    "fixed",
          zIndex:      45,
          perspective: "900px",
          transformOrigin: "top left",
          willChange: "transform",
          visibility: HERO.showCharacter ? "visible" : "hidden",
          opacity: navHidden ? 0 : 1,
          pointerEvents: "none",
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
            style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              ref={imgRef}
              src={FRAMES[12]}
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
            {/* The live pupils, laid over frame 0. They sit under the eyelid line and hang from it, so a small
                move up or down never leaves a gap. Shown only while frame 0 is up. */}
            <svg
              ref={pupilsRef}
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0 }}
            >
              <ellipse ref={pupilL} cx={EYES[0].x} cy={EYES[0].y} rx="12.5" ry="11" fill="#050505" />
              <ellipse ref={pupilR} cx={EYES[1].x} cy={EYES[1].y} rx="12.5" ry="11" fill="#050505" />
            </svg>
          </div>
        </div>
        {/* Only the drawing itself is clickable, not the empty square around it */}
        <div
          role="button"
          aria-label="Aarchi"
          onClick={isHome ? handleClick : onHome}
          style={{
            position: "absolute", left: "28%", top: "22%", width: "47.5%", height: "56%",
            cursor: "pointer",
            pointerEvents: navHidden || !HERO.showCharacter ? "none" : "auto",
          }}
        />
      </div>

      {/* ── Left of the mascot — the rolling word ── */}
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

      {/* ── DESIGNER, fixed ── */}
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

      {/* ── The intro line, under the big words (beside the character on desktop, under it on a phone) ── */}
      <p
        ref={introRef}
        className="font-sans font-light leading-snug text-ink/75"
        style={{
          position:      "fixed",
          zIndex:        44,
          opacity:       0,
          margin:        0,
          pointerEvents: "none",
          willChange:    "transform, opacity",
        }}
      >
        {INTRO}
      </p>

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
          animation: none; /* the big words stay still (they used to float up and down with the mascot) */
        }
        @media (prefers-reduced-motion: reduce) {
          .mascot-breathe, .hero-text-bob { animation: none !important; }
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
