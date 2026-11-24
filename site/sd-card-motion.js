// The phone renders use the same motion curves as the live camera.
const clamp = t => Math.min(1, Math.max(0, t));
const smooth = t => t * t * (3 - 2 * t);
const glide = (t, from, to) => smooth(clamp((t - from) / (to - from)));
const pulse = (t, from, to) => (t <= from || t >= to) ? 0 : Math.sin(Math.PI * glide(t, from, to)) ** 2;

export const restPose = { turn: 0, hatch: 0, slide: 0, air: 0, rock: 0 };
export const cardTravel = { slot: 5.90, side: 16.3, drop: 2.2, depth: 4.2, roll: .72 };
const ejectStart = 546;
const hiddenAt = 335;
const seatedAt = 735;

function cardFlight(t) {
 return {
  slide: glide(t, 0, 180) * (1 - glide(t, 540, seatedAt)),
  air: glide(t, 180, hiddenAt) * (1 - glide(t, 375, 540)),
 };
}

export const swapPaths = {
 auto: { duration: 1850, flip: ejectStart + hiddenAt, seat: ejectStart + seatedAt },
 turn: { duration: 470 },
 hatch: { duration: 235 },
 swap: { duration: 925, flip: hiddenAt, seat: seatedAt },
 close: { duration: 510 },
};

export function sampleMotion(path, elapsed) {
 const t = Math.max(0, Math.min(swapPaths[path].duration, elapsed));
 if (path === 'auto') {
  const { seat, duration } = swapPaths.auto;
  return {
   turn: glide(t, 22, 490) * (1 - glide(t, 1400, duration)),
   hatch: glide(t, 315, 548) * (1 - glide(t, seat, 1510)),
   ...cardFlight(t - ejectStart),
   rock: -.021 * pulse(t, 0, 108) + .020 * pulse(t, 397, 610) +
    .014 * pulse(t, 1220, 1380) - .012 * pulse(t, 1700, 1840),
  };
 }
 if (path === 'turn') return { ...restPose, turn: glide(t, 20, 470),
  rock: -.020 * pulse(t, 0, 100) + .014 * pulse(t, 380, 469) };
 if (path === 'hatch') return { ...restPose, turn: 1, hatch: glide(t, 0, 235),
  rock: .014 * pulse(t, 90, 235) };
 if (path === 'swap') {
  const { seat, duration } = swapPaths.swap;
  return {
   turn: 1,
   hatch: 1 - glide(t, seat, duration),
   ...cardFlight(t),
   rock: .013 * pulse(t, 680, 830),
  };
 }
 return { ...restPose, turn: 1 - glide(t, 95, 510),
  hatch: 1 - glide(t, 0, 200), rock: -.010 * pulse(t, 360, 508) };
}

export const mobileMotion = {
 columns: 12,
 fps: 48,
 groups: { auto: ['auto'], manual: ['turn', 'hatch', 'swap', 'close'] },
};
export const frameCount = path => Math.ceil(swapPaths[path].duration * mobileMotion.fps / 1000) + 1;
