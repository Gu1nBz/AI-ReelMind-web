import { animate, stagger } from "animejs";

const media = typeof window !== "undefined"
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;

export function motionEnabled() {
  return !media?.matches;
}

export function animateEntrance(
  targets: string | HTMLElement | HTMLElement[] | NodeListOf<Element>,
  delay = 0
) {
  if (!motionEnabled()) {
    return null;
  }

  return animate(targets as never, {
    opacity: [0, 1],
    translateY: [22, 0],
    duration: 420,
    delay,
    ease: "outCubic"
  });
}

export function animateStaggered(
  targets: string | HTMLElement[] | NodeListOf<Element>,
  startDelay = 0
) {
  if (!motionEnabled()) {
    return null;
  }

  return animate(targets as never, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 360,
    delay: stagger(70, { start: startDelay }),
    ease: "outCubic"
  });
}

export function animatePulse(target: string | HTMLElement) {
  if (!motionEnabled()) {
    return null;
  }

  return animate(target as never, {
    scale: [1, 1.04, 1],
    duration: 360,
    ease: "inOutQuad"
  });
}
