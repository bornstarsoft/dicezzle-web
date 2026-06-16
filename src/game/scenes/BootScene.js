import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.json('dicezzleConfig', '/game/dicezzle/data/config.json');
  }

  create() {
    this.scene.start('GameScene', {
      config: this.cache.json.get('dicezzleConfig')
    });
  }
}
