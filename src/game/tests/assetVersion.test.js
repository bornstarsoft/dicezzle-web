import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const ASSET_VERSION = '20260618-sound-stack-v1';

describe('Dicezzle game asset versioning', () => {
  test('defines a manual game asset version in Hugo config', () => {
    const hugoConfig = readFileSync(new URL('../../../hugo.toml', import.meta.url), 'utf8');

    expect(hugoConfig).toContain(`gameAssetVersion = '${ASSET_VERSION}'`);
  });

  test('loads game CSS and JS with the configured version query', () => {
    const headPartial = readFileSync(new URL('../../../layouts/partials/head.html', import.meta.url), 'utf8');
    const baseTemplate = readFileSync(new URL('../../../layouts/_default/baseof.html', import.meta.url), 'utf8');

    expect(headPartial).toContain('site.Params.gameAssetVersion');
    expect(headPartial).toContain('/game/dicezzle/dicezzle-game.css?v={{ $gameAssetVersion }}');
    expect(baseTemplate).toContain('site.Params.gameAssetVersion');
    expect(baseTemplate).toContain('/game/dicezzle/dicezzle-game.js?v={{ $gameAssetVersion }}');
  });

  test('asks static hosts to revalidate game bundles', () => {
    const headers = readFileSync(new URL('../../../static/_headers', import.meta.url), 'utf8');

    expect(headers).toContain('/game/dicezzle/dicezzle-game.js');
    expect(headers).toContain('/game/dicezzle/dicezzle-game.css');
    expect(headers).toContain('Cache-Control: public, max-age=0, must-revalidate');
  });
});
