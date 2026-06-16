import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';

function bootDicezzle() {
  const parent = document.getElementById('dicezzle-game');
  if (!parent || parent.dataset.dicezzleReady === 'true') {
    return;
  }

  parent.dataset.dicezzleReady = 'true';

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#f3f7f4',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parent.clientWidth || 390,
      height: parent.clientHeight || 560
    },
    render: {
      antialias: true,
      pixelArt: false
    },
    scene: [BootScene, GameScene]
  });

  window.DicezzleGame = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootDicezzle);
} else {
  bootDicezzle();
}
