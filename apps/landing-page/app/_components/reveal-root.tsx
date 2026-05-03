'use client';

import { useEffect } from 'react';

/**
 * RevealRoot — single client island that drives all scroll-triggered
 * reveal animations on the landing page.
 *
 * How it works:
 *   1. Every element in `app/page.tsx` that should animate carries a
 *      `data-reveal` attribute (optionally `data-reveal='left' | 'right' |
 *      'scale' | 'rise-lg'` to pick a variant).
 *   2. CSS in `globals.css` defines the rest: initial offset/opacity,
 *      transition, and the `data-revealed='true'` end state.
 *   3. This component sets up a single IntersectionObserver and flips the
 *      `data-revealed` attribute when each element first enters the
 *      viewport. After firing, it stops observing (one-shot reveal).
 *
 * Why a client island and not CSS scroll-driven animations alone:
 *   - CSS `animation-timeline: view()` is great in modern browsers but
 *     still inconsistent in Safari/older Chrome. IntersectionObserver is
 *     universal and trivially small.
 *   - Keeps `app/page.tsx` a pure server component; only this 30-line
 *     island ships to the client.
 *
 * Reduced motion:
 *   - When `(prefers-reduced-motion: reduce)` is set, every reveal
 *     element is immediately marked revealed so users never see the
 *     animated state.
 */
export function RevealRoot() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      '[data-reveal]:not([data-revealed])',
    );
    if (elements.length === 0) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduceMotion) {
      for (const el of elements) {
        el.dataset.revealed = 'true';
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.dataset.revealed = 'true';
          observer.unobserve(target);
        }
      },
      {
        threshold: 0.12,
        // Start the reveal a touch before the element fully enters,
        // so motion finishes around the time the user is reading it.
        rootMargin: '0px 0px -8% 0px',
      },
    );

    for (const el of elements) {
      // Above-the-fold elements (hero copy + hero art) might already be
      // intersecting at mount; observe() will fire immediately for those.
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
