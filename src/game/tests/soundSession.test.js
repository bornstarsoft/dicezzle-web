import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const gameSceneSource = readFileSync(new URL('../scenes/GameScene.js', import.meta.url), 'utf8');

describe('sound session wiring', () => {
  test('starts each page boot with sound disabled instead of restoring localStorage', () => {
    expect(gameSceneSource).toContain('this.sound = new SoundService();');
    expect(gameSceneSource).not.toContain('enabled: this.storage.isSoundEnabled()');
  });

  test('keeps sound toggle state in memory for restart instead of persisting it', () => {
    expect(gameSceneSource).not.toContain('this.storage.setSoundEnabled(next)');
    expect(gameSceneSource).toMatch(/const next = !this\.sound\.isEnabled\(\)/);
    expect(gameSceneSource).toMatch(/this\.sound\.setEnabled\(next\)/);
  });

  test('plays stack and upgrade sounds from the merge stack timing', () => {
    expect(gameSceneSource).toContain('this.sound.playStackLayer(layerIndex, totalSteps);');
    expect(gameSceneSource).toContain('this.sound.playMergeComplete({');
    expect(gameSceneSource).not.toContain('this.playMergeSound(event);');
  });
});
