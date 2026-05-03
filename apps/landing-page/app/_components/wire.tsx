/*
 * Global wire — the slim editorial ticker between the hero and About.
 *
 * The cities row (top) is decorative and stays static. The contributors
 * row (bottom, reverse direction) is fetched live from the GitHub API
 * so that visitors always see the people who actually moved the repo
 * forward, not a hand-curated lineage list:
 *
 *   GET https://api.github.com/repos/nexu-io/open-design/contributors
 *
 * Each entry becomes a `<a class='wire-item is-link'>` linking straight
 * to the contributor's GitHub profile. We:
 *
 *   - filter out bot accounts (`type === 'Bot'` or `*[bot]` logins),
 *   - keep the top N by contribution count,
 *   - apply named editorial roles to known handles (kami, guizang…)
 *     and fall back to "<count> commits" for everyone else,
 *   - always append a trailing "@you · be next" link to the
 *     contributors graph so the editorial CTA stays intact.
 *
 * Hydration is stable: the SSR markup uses the same `FALLBACK` list
 * the client renders before the fetch resolves. After the fetch the
 * marquee silently swaps in the live data; the underlying CSS marquee
 * animation continues uninterrupted because we only mutate children
 * inside the existing `.marquee-track` element.
 *
 * If the fetch is blocked (offline, rate limited, network failure),
 * the fallback list stays visible — the section never goes empty.
 */
'use client';

import { useEffect, useState } from 'react';

const REPO = 'https://github.com/nexu-io/open-design';
const REPO_CONTRIBUTORS_API = `https://api.github.com/repos/nexu-io/open-design/contributors?per_page=12`;
const REPO_CONTRIBUTORS_PAGE = `${REPO}/graphs/contributors`;

const ext = {
  target: '_blank',
  rel: 'noreferrer noopener',
} as const;

// Editorial role labels. Known lineage handles get a curated word so the
// marquee reads like a contributor masthead rather than a commit log.
// Anyone outside this map shows their commit count instead — still
// informative, still typographically uniform.
const ROLE_OVERRIDES: Record<string, string> = {
  tw93: 'kami',
  op7418: 'guizang',
  alchaincyf: 'huashu',
  OpenCoworkAI: 'codesign',
  'nexu-io': 'studio',
  lewislulu: 'html-ppt',
};

const TRAILING_CTA: Contributor = {
  handle: 'you',
  role: 'be next',
  href: REPO_CONTRIBUTORS_PAGE,
};

type Contributor = {
  handle: string;
  role: string;
  href: string;
};

// SSR-safe initial list. Used until the GitHub fetch resolves AND as
// the permanent fallback when the network is unavailable. Mirrors the
// canonical wire row in `skills/editorial-collage/example.html` so
// hydration is byte-stable against the static reference rendering.
const FALLBACK: ReadonlyArray<Contributor> = [
  { handle: 'tw93', role: 'kami', href: 'https://github.com/tw93' },
  { handle: 'op7418', role: 'guizang', href: 'https://github.com/op7418' },
  {
    handle: 'alchaincyf',
    role: 'huashu',
    href: 'https://github.com/alchaincyf',
  },
  {
    handle: 'multica-ai',
    role: 'daemon',
    href: 'https://github.com/multica-ai',
  },
  {
    handle: 'OpenCoworkAI',
    role: 'codesign',
    href: 'https://github.com/OpenCoworkAI',
  },
  { handle: 'nexu-io', role: 'studio', href: 'https://github.com/nexu-io' },
  TRAILING_CTA,
];

type GhContributor = {
  login: string;
  html_url: string;
  type: string;
  contributions: number;
};

function isGhContributor(value: unknown): value is GhContributor {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.login === 'string' &&
    typeof v.html_url === 'string' &&
    typeof v.type === 'string' &&
    typeof v.contributions === 'number'
  );
}

function roleFor(login: string, contributions: number): string {
  const named = ROLE_OVERRIDES[login];
  if (named) {
    return named;
  }
  // "1 commit" / "N commits" — singular vs plural reads better than "1 commits".
  return `${contributions} ${contributions === 1 ? 'commit' : 'commits'}`;
}

type City = { name: string; coord: string };

export function Wire({ cities }: { cities: ReadonlyArray<City> }) {
  const [contribs, setContribs] = useState<ReadonlyArray<Contributor>>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch(REPO_CONTRIBUTORS_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http error'))))
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) {
          return;
        }
        const live: Contributor[] = data
          .filter(isGhContributor)
          .filter((c) => c.type !== 'Bot' && !c.login.endsWith('[bot]'))
          .slice(0, 12)
          .map((c) => ({
            handle: c.login,
            role: roleFor(c.login, c.contributions),
            href: c.html_url,
          }));
        if (live.length === 0) {
          return;
        }
        live.push(TRAILING_CTA);
        setContribs(live);
      })
      .catch(() => {
        // Rate-limited, offline, blocked — keep the fallback visible.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Doubled tracks are required for the seamless `translateX(-50%)`
  // marquee loop defined in globals.css.
  const cityTrack = [...cities, ...cities];
  const contribTrack = [...contribs, ...contribs];

  return (
    <section
      className='wire'
      data-od-id='wire'
      aria-label='Global wire — cities and contributors'
    >
      <div className='container wire-inner'>
        <div className='wire-left'>
          <span className='wire-mark' aria-hidden='true'>
            <span className='wire-pulse' />
          </span>
          <span className='wire-title'>
            <b>From the field</b>
            <span>
              Open · {cities.length} cities ·{' '}
              {Math.max(0, contribs.length - 1)} contributors
            </span>
          </span>
        </div>
        <div className='wire-rows'>
          <div className='wire-row'>
            <div className='marquee-track' aria-hidden='true'>
              {cityTrack.map((c, i) => (
                <span className='wire-item' key={`city-${i}`}>
                  <span className='wire-dot'>·</span>
                  <span className='wire-coord'>{c.coord}</span>
                  <span className='wire-name'>{c.name}</span>
                </span>
              ))}
            </div>
          </div>
          <div className='wire-row reverse'>
            <div className='marquee-track'>
              {contribTrack.map((c, i) => (
                <a
                  className='wire-item is-link'
                  key={`contrib-${i}-${c.handle}`}
                  href={c.href}
                  aria-label={`Open ${c.handle} on GitHub`}
                  {...ext}
                >
                  <span className='wire-dot'>·</span>
                  <span className='wire-handle'>@{c.handle}</span>
                  <span className='wire-role'>{c.role}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
