/*
 * Sticky Header — handles two pieces of dynamic behavior the static page
 * cannot express on its own:
 *
 * 1. Headroom-style hide/show on scroll. The header is `position: sticky`,
 *    so it naturally docks at the viewport top once the user scrolls past
 *    the topbar. Layered on top, this component:
 *      - Forces the nav fully visible while the user is near the very top
 *        (so the brand sits just under the topbar with no animation).
 *      - Hides the nav (translateY(-100%)) when the user is scrolling
 *        downward past a threshold.
 *      - Re-pins the nav (translateY(0)) when the user scrolls up or
 *        stays still.
 *    The CSS transition on `transform` provides the slide-in entrance
 *    animation requested by the brief.
 *
 * 2. Live GitHub star count. The text in the nav CTA used to read
 *    "Star · 0K" as a placeholder; we now fetch the real stargazer count
 *    from the GitHub REST API on mount and format it for display.
 *
 * The component is a self-contained client island. The rest of the page
 * stays as RSC. When the canonical example.html changes the nav layout,
 * mirror the diff here.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

const REPO = 'https://github.com/nexu-io/open-design';
const REPO_API = 'https://api.github.com/repos/nexu-io/open-design';
const REPO_RELEASES = `${REPO}/releases`;
const REPO_SKILLS = `${REPO}/tree/main/skills`;
const REPO_DESIGN_SYSTEMS = `${REPO}/tree/main/design-systems`;

const ext = {
  target: '_blank',
  rel: 'noreferrer noopener',
} as const;

// Distance from top of document at which we start allowing hide-on-scroll.
// Below this threshold, the header is always shown to avoid flicker while
// the topbar is still partially visible.
const SHOW_TOP_THRESHOLD = 100;

// Per-frame deadband. Scroll events fire on every wheel tick — without
// this, mousewheel jitter would toggle the visibility class repeatedly.
const SCROLL_DELTA = 6;

function formatStars(count: number): string {
  if (!Number.isFinite(count) || count <= 0) {
    return '0';
  }
  if (count < 1000) {
    return String(count);
  }
  const k = (count / 1000).toFixed(1).replace(/\.0$/, '');
  return `${k}K`;
}

export function Header() {
  // Nav visibility state. `true` = pinned (visible), `false` = hidden.
  // Initial value matches the SSR markup so hydration is stable.
  const [pinned, setPinned] = useState(true);
  const lastY = useRef(0);

  const [stars, setStars] = useState<number | null>(null);

  // GitHub star count — fetched once on mount. Failures fall back to the
  // SSR placeholder ("0") silently; the CTA is still functional.
  useEffect(() => {
    let cancelled = false;
    fetch(REPO_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http error'))))
      .then((data: unknown) => {
        if (cancelled) return;
        if (
          data &&
          typeof data === 'object' &&
          'stargazers_count' in data &&
          typeof (data as { stargazers_count: unknown }).stargazers_count ===
            'number'
        ) {
          setStars((data as { stargazers_count: number }).stargazers_count);
        }
      })
      .catch(() => {
        // Network blocked, rate-limited, etc. — leave the placeholder.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Headroom-style scroll listener. We track the previous scroll position
  // in a ref so the listener never reattaches.
  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastY.current;
      const delta = y - prev;

      if (y <= SHOW_TOP_THRESHOLD) {
        // Near the top of the page — always show, no special sticky styling.
        setPinned(true);
      } else if (delta > SCROLL_DELTA) {
        // Scrolling down past the deadband — hide.
        setPinned(false);
      } else if (delta < -SCROLL_DELTA) {
        // Scrolling up past the deadband — show. The CSS transition on
        // transform turns this into the requested slide-in animation.
        setPinned(true);
      }

      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = `nav${pinned ? '' : ' is-hidden'}`;
  const starLabel = stars === null ? '0' : formatStars(stars);

  return (
    <header className={navClass} data-od-id='nav'>
      <div className='container nav-inner'>
        <a href='#top' className='brand'>
          <span className='brand-mark'>Ø</span>
          <span>Open Design</span>
          <span className='brand-meta'>
            <b>Studio Nº 01</b>Berlin / Open / Earth
          </span>
        </a>
        <nav>
          <ul className='nav-links'>
            <li>
              <a href={REPO_SKILLS} {...ext}>
                Skills<span className='num'>31</span>
              </a>
            </li>
            <li>
              <a href={REPO_DESIGN_SYSTEMS} {...ext}>
                Systems<span className='num'>72</span>
              </a>
            </li>
            <li>
              <a href='#agents'>
                Agents<span className='num'>12</span>
              </a>
            </li>
            <li>
              <a href='#labs'>
                Labs<span className='num'>05</span>
              </a>
            </li>
            <li>
              <a href='#contact'>Contact</a>
            </li>
          </ul>
        </nav>
        <div className='nav-side'>
          <a
            className='nav-cta ghost'
            href={REPO_RELEASES}
            aria-label='Download Open Design desktop'
            title='Download the desktop app'
            {...ext}
          >
            Download
          </a>
          <a
            className='nav-cta'
            href={REPO}
            aria-label={`Star Open Design on GitHub — ${starLabel} stars`}
            title='Click to star us on GitHub'
            {...ext}
          >
            {`Star · ${starLabel}`}
          </a>
          <span className='status-dot' aria-hidden='true' />
        </div>
      </div>
    </header>
  );
}
