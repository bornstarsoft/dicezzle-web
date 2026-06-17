import { DiceStyle } from './DiceStyle.js';

export function getStarsHudState({ starsCreated = 0, starClears = 0 } = {}) {
  return {
    label: 'Stars',
    iconValue: 'star',
    countText: `×${starsCreated}`,
    clearsText: `Clears ${starClears}`,
    starsCreated,
    starClears,
    style: DiceStyle.forValue('star')
  };
}
