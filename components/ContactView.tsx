import React, { useEffect, useRef } from 'react';

// label (left) | value (right) | link | mascot face while this row is beside it | live-clock flag
type Row = [string, string, string | null, number, boolean?];

const ROWS: Row[] = [
  ['Based in', 'Delhi NCR', null, 11],
  ['', 'India', null, 11],
  ['Current time', '--:--:-- (IST)', null, 8, true],
  ['Email', 'aarchimadaan@gmail.com', 'https://mail.google.com/mail/?view=cm&fs=1&to=aarchimadaan@gmail.com', 1],
  ['Telephone', '+91 9289664869', 'tel:9289664869', 10],
  ['Instagram', '@sosillybilli.design', 'https://www.instagram.com/sosillybilli.design/', 4],
  ['LinkedIn', 'aarchi-madaan', 'https://linkedin.com/in/aarchi-madaan-4634a32b5/', 5],
  ['Behance', 'aarchimadaan', 'https://behance.net/aarchimadaan', 3],
  ['Dribbble', 'Aarchi_', 'https://dribbble.com/Aarchi_', 8],
  ['Resume', 'Download (PDF)', '/resume.pdf', 9],
];

const FRAMES: Record<number, string> = { 1: 'smile', 2: 'tongue', 3: 'grin', 4: 'smirk', 5: 'neutral', 8: 'quirk', 9: 'donut', 10: 'whistle', 11: 'open_eyes' };
const frameSrc = (n: number) => `/mascot/frame_${n}_${FRAMES[n]}.png`;
const EXPRESSIONS = Object.keys(FRAMES).map(Number);
let lastArrival = 0; // so two visits in a row never land on the same face

// everything here is sized together (mascot, text, spacing): the page is scaled by BIG relative to its first design, so it fills the screen
const BIG = 1.43;
const MAX_SHIFT = Math.round(82 * BIG); // px each label/value slides away from the mascot
const PLATEAU = Math.round(40 * BIG); // rows this close to the mascot's middle get the full shift
const FALLOFF = Math.round(140 * BIG); // vertical reach of the "parting"
const smooth = (t: number) => t * t * (3 - 2 * t);

const rowHTML = (r: Row) => {
  const value = r[2]
    ? `<a class="cv-val" href="${r[2]}" ${r[2].startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${r[1]}</a>`
    : `<span class="cv-val${r[4] ? ' cv-clock' : ''}" ${r[4] ? 'data-clock' : ''}>${r[1]}</span>`;
  return `<div class="cv-row${r[0] ? '' : ' cv-cont'}"><span class="cv-lab">${r[0]}</span>${value}</div>`;
};

const CSS = `
.cv-root { position: fixed; inset: 0; z-index: 30; pointer-events: none; color: #1A1A1A; font-family: 'Mallanna', sans-serif; font-weight: 400; }
.cv-stage, .cv-corner { animation: cv-in .8s ease-out .5s both; }
@keyframes cv-in { from { opacity: 0; } to { opacity: 1; } }

.cv-mascot { position: absolute; left: 50%; top: 50%; width: 300px; height: 300px; transform: translate(-50%, -50%); perspective: 900px; }
.cv-tilt { width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform; }
.cv-breathe { width: 100%; height: 100%; animation: cv-breathe 4.2s ease-in-out infinite; }
.cv-mascot img { width: 100%; height: 100%; object-fit: contain; display: block; user-select: none; -webkit-user-drag: none; filter: drop-shadow(0 28px 48px rgba(0,0,0,.11)); }
@keyframes cv-breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.012); } }

.cv-stage { position: absolute; inset: 0; overflow: hidden; }
.cv-copy { position: absolute; left: 0; right: 0; top: 0; will-change: transform; }
.cv-row { display: flex; height: 35px; line-height: 35px; font-size: 20px; white-space: nowrap; }
.cv-lab, .cv-val { flex: 1 1 0; will-change: transform; }
.cv-lab { text-align: right; padding-right: 14px; color: #1A1A1A; }
.cv-val { text-align: left; padding-left: 14px; color: #A9A89F; }
.cv-clock { font-variant-numeric: tabular-nums; }
a.cv-val { pointer-events: auto; text-decoration: underline; text-decoration-color: transparent; text-decoration-thickness: 1px; text-underline-offset: 4px; transition: color .2s, text-decoration-color .2s; }
a.cv-val:hover { color: #2A52BE; text-decoration-color: currentColor; }

.cv-corner { position: absolute; bottom: 28px; font-size: 16px; }
.cv-status { left: 28px; display: flex; align-items: center; gap: 10px; }
.cv-dot { width: 8px; height: 8px; border-radius: 50%; background: #2A52BE; position: relative; }
.cv-dot::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1px solid #2A52BE; animation: cv-ping 1.8s ease-out infinite; }
@keyframes cv-ping { 0% { transform: scale(.5); opacity: .9; } 100% { transform: scale(1.6); opacity: 0; } }
.cv-tagline { right: 28px; color: #A9A89F; }

@media (max-width: 719px) {
  .cv-mascot { width: 190px; height: 190px; top: 22vh; }
  .cv-row { height: auto; line-height: 1.3; font-size: 16px; flex-direction: column; padding: 6px 0; }
  .cv-lab, .cv-val { text-align: left; padding: 0; flex: none; }
  .cv-lab { font-size: 12px; opacity: .5; }
  .cv-row.cv-cont { padding-top: 0; }
  .cv-row.cv-cont .cv-lab { display: none; }
  .cv-stage { top: 40vh; left: 28px; right: 28px; bottom: 0; }
  .cv-tagline { display: none; }
}
`;

interface BuiltRow { lab: HTMLElement; val: HTMLElement; top: number; h: number; shift: number; mood: number }

export const ContactView: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const mascotImgRef = useRef<HTMLImageElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const mascot = mascotRef.current;
    const mascotImg = mascotImgRef.current;
    const tilt = tiltRef.current;
    if (!stage || !mascot || !mascotImg || !tilt) return;

    // The site's corner mascot is still in the DOM (just faded out), so start from exactly where it sits and glide to the middle.
    const corner = document.querySelector('img[alt="Mascot"]') as HTMLImageElement | null;
    const from = corner?.getBoundingClientRect();
    const hasFrom = !!from && from.width > 20 && from.width < window.innerWidth * 0.8;
    const fromW = hasFrom ? from!.width : 72;
    const fromCx = hasFrom ? from!.left + from!.width / 2 : 56;
    const fromCy = hasFrom ? from!.top + from!.height / 2 : 52;
    const to = mascot.getBoundingClientRect();
    const dx = fromCx - (to.left + to.width / 2);
    const dy = fromCy - (to.top + to.height / 2);
    const glide = mascot.animate(
      [
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${fromW / to.width})` },
        { transform: 'translate(-50%, -50%) scale(1)' },
      ],
      { duration: 1000, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    );
    if (hasFrom && corner && /\/mascot\//.test(corner.src)) mascotImg.src = corner.src;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    Object.keys(FRAMES).forEach((n) => { const i = new Image(); i.src = frameSrc(+n); });

    const narrowMQ = window.matchMedia('(max-width: 719px)');
    // Faces follow the rows while they pass the mascot; once they've scrolled clear (and on arrival) it picks a random face.
    let mood = 0, wasNear = false;
    const randomMood = (avoid: number) => {
      const pool = EXPRESSIONS.filter((n) => n !== avoid);
      return pool[Math.floor(Math.random() * pool.length)];
    };
    const setMood = (n: number) => { if (n !== mood) { mood = n; mascotImg.src = frameSrc(n); } };
    glide.onfinish = () => { const n = randomMood(lastArrival); lastArrival = n; setMood(n); };

    let copies: { el: HTMLElement; rows: BuiltRow[] }[] = [];
    let H = 1, winH = 1, centerY = 1, s = 0, target = 0, started = false;
    let raf = 0, tiltRaf = 0, disposed = false;

    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => { const t = fmt.format(new Date()) + ' (IST)'; stage.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = t; }); };

    const build = () => {
      winH = stage.clientHeight; centerY = winH / 2;
      stage.innerHTML = '';
      const html = ROWS.map(rowHTML).join('');
      const probe = document.createElement('div'); probe.className = 'cv-copy'; probe.innerHTML = html; probe.style.visibility = 'hidden';
      stage.appendChild(probe);
      const listH = probe.offsetHeight; stage.innerHTML = '';
      H = listH + (narrowMQ.matches ? winH * 0.15 : winH * 0.85);
      const n = Math.ceil(winH / H) + 2;
      copies = Array.from({ length: n }, () => {
        const el = document.createElement('div'); el.className = 'cv-copy'; el.innerHTML = html; stage.appendChild(el);
        const rows: BuiltRow[] = Array.from(el.children).map((row, i) => ({
          lab: row.firstElementChild as HTMLElement, val: row.lastElementChild as HTMLElement,
          top: (row as HTMLElement).offsetTop, h: (row as HTMLElement).offsetHeight, shift: 0, mood: ROWS[i][3],
        }));
        return { el, rows };
      });
      if (!started) { s = target = -winH * 0.92; started = true; }
      tick();
    };

    const render = () => {
      if (disposed) return;
      s += (target - s) * 0.12;
      const mod = ((s % H) + H) % H;
      const split = !narrowMQ.matches;
      let nearest: BuiltRow | null = null, nd = 1e9;
      copies.forEach((c, k) => {
        const top = (k - 1) * H - mod;
        c.el.style.transform = `translate3d(0, ${top}px, 0)`;
        c.rows.forEach((r) => {
          const ad = Math.abs(top + r.top + r.h / 2 - centerY);
          if (ad < nd) { nd = ad; nearest = r; }
          let shift = 0;
          if (split && ad < FALLOFF) shift = MAX_SHIFT * smooth(Math.min(1, (FALLOFF - ad) / (FALLOFF - PLATEAU)));
          if (Math.abs(shift - r.shift) > 0.05) {
            r.shift = shift;
            r.lab.style.transform = `translate3d(${-shift}px,0,0)`;
            r.val.style.transform = `translate3d(${shift}px,0,0)`;
          }
        });
      });
      const moved = Math.abs(s + winH * 0.92) > 30;
      const near = !!nearest && nd < 90 && moved;
      if (near) setMood((nearest as BuiltRow).mood);
      else if (wasNear && moved) setMood(randomMood(mood));
      wasNear = near;
      raf = requestAnimationFrame(render);
    };

    const onWheel = (e: WheelEvent) => { e.preventDefault(); target += Math.max(-150, Math.min(150, e.deltaY)) * 0.16; };
    const onKey = (e: KeyboardEvent) => {
      const k = ({ ArrowDown: 24, ArrowUp: -24, PageDown: 160, PageUp: -160, ' ': 160 } as Record<string, number>)[e.key];
      if (k) { e.preventDefault(); target += k; }
    };
    let ty: number | null = null;
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => { if (ty == null) return; const y = e.touches[0].clientY; target += (ty - y) * 0.9; ty = y; };

    let rx = 0, ry = 0, trx = 0, tryy = 0;
    const onMouse = (e: MouseEvent) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      tryy = ((e.clientX - cx) / cx) * 9; trx = -((e.clientY - cy) / cy) * 7;
    };
    const tiltLoop = () => {
      if (disposed) return;
      rx += (trx - rx) * 0.08; ry += (tryy - ry) * 0.08;
      tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      tiltRaf = requestAnimationFrame(tiltLoop);
    };

    build();
    const clock = window.setInterval(tick, 1000);
    raf = requestAnimationFrame(render);
    tiltRaf = requestAnimationFrame(tiltLoop);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize', build);

    return () => {
      disposed = true;
      glide.cancel();
      cancelAnimationFrame(raf); cancelAnimationFrame(tiltRaf); window.clearInterval(clock);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', build);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  return (
    <div className="cv-root">
      <style>{CSS}</style>

      <div className="cv-mascot" ref={mascotRef}>
        <div className="cv-tilt" ref={tiltRef}>
          <div className="cv-breathe">
            <img ref={mascotImgRef} src={frameSrc(11)} alt="Aarchi's mascot" draggable={false} />
          </div>
        </div>
      </div>

      <div className="cv-stage" ref={stageRef} />

      <div className="cv-corner cv-status"><span className="cv-dot" /><span>Open to work</span></div>
      <div className="cv-corner cv-tagline">Brand &amp; interaction designer</div>
    </div>
  );
};
