import { describe, expect, it } from 'vitest';
import { rewriteSkillAssetUrls } from '../src/server.js';

describe('rewriteSkillAssetUrls', () => {
  it('rewrites ./assets/<file> img sources to the daemon route', () => {
    const html = `<img src='./assets/hero.png' alt='' />`;
    expect(rewriteSkillAssetUrls(html, 'editorial-collage')).toBe(
      `<img src='/api/skills/editorial-collage/assets/hero.png' alt='' />`,
    );
  });

  it('handles double quotes and the no-leading-dot variant', () => {
    const html = `<img src="assets/cta.png"><a href="./assets/diagram.svg"></a>`;
    expect(rewriteSkillAssetUrls(html, 'foo')).toBe(
      `<img src="/api/skills/foo/assets/cta.png"><a href="/api/skills/foo/assets/diagram.svg"></a>`,
    );
  });

  it('leaves absolute and fragment URLs untouched', () => {
    const html = `<a href='https://example.com/assets/x.png'></a><a href='#assets'></a>`;
    expect(rewriteSkillAssetUrls(html, 'foo')).toBe(html);
  });

  it('escapes the skill id so a path-traversal id cannot synthesise a route', () => {
    const html = `<img src='./assets/hero.png' />`;
    expect(rewriteSkillAssetUrls(html, '../oops')).toBe(
      `<img src='/api/skills/..%2Foops/assets/hero.png' />`,
    );
  });

  it('returns non-string input unchanged', () => {
    expect(rewriteSkillAssetUrls('', 'foo')).toBe('');
  });
});
