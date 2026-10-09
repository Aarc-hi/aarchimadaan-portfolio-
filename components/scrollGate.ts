// A single shared lock used by useHomeSnap (hero/about/works entry), MascotHero (revealing the words)
// and WorksStrip (the strip, the hand-offs to the intro text and the footer). Without a shared gate,
// one component's in-flight animation doesn't block another's trigger — e.g. WorksStrip animating
// scrollY back toward aboutTop passes through values useHomeSnap's own zone check would read as
// "parked at About", letting it fire a second, competing scrollTo of its own.
//
// Two kinds of lock:
//   animation — a transition of known length is running. Nothing gets through.
//   grace     — the animation is over, but the trackpad's trailing momentum from the same gesture is still
//               arriving, so wheel events keep being swallowed. A BRAND NEW gesture (see isNewGesture)
//               cuts the grace short, so people who flick again right away are not left waiting for the
//               old momentum to die out.

let animUntil = 0;
let graceUntil = 0;
const GRACE_MS = 280; // still enough to absorb trailing scroll momentum

export function lockGateFor(ms: number) {
  animUntil = Math.max(animUntil, performance.now() + ms);
}

// Call when a still-locked gate receives more input (trailing scroll momentum),
// or right as an animation completes — pushes the reopen point out so trailing
// events from the same physical gesture don't read as a new, separate scroll.
export function extendGate() {
  graceUntil = Math.max(graceUntil, performance.now() + GRACE_MS);
}

// ── Telling a new flick from trailing momentum ────────────────────────────────────────────────────
// Every wheel event is looked at once, here, before any handler runs. A trackpad's momentum is a run
// of events whose size only ever shrinks; a new flick either follows a pause, or jumps up in size.
const NEW_AFTER_PAUSE_MS = 140;
let lastT = -1e9;
let lastAbs = 0;
let currentIsNew = true;

function track(e: WheelEvent) {
  const a = Math.max(Math.abs(e.deltaY), Math.abs(e.deltaX));
  const gap = e.timeStamp - lastT;
  currentIsNew = gap > NEW_AFTER_PAUSE_MS || (a >= 15 && a > lastAbs * 1.3 + 6);
  lastT = e.timeStamp;
  lastAbs = a;
}
if (typeof window !== 'undefined') {
  window.addEventListener('wheel', track, { capture: true, passive: true });
}

// True while handling the wheel event that starts a new gesture (the first after a pause, or a flick
// that is clearly stronger than the momentum before it).
export function isNewGesture(): boolean {
  return currentIsNew;
}

// Pass the wheel event being handled (if any). A new gesture during the grace period gets through.
export function isGateLocked(e?: WheelEvent): boolean {
  const now = performance.now();
  if (now < animUntil) return true;
  if (now < graceUntil) {
    if (e && currentIsNew) { graceUntil = 0; return false; }
    return true;
  }
  return false;
}
