import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Loading bar
    const { width, height } = this.scale
    const bar = this.add.rectangle(width / 2, height / 2, 0, 20, 0x00ff88)
    const border = this.add.rectangle(width / 2, height / 2, 300, 24).setStrokeStyle(2, 0xffffff)

    this.load.on('progress', (value: number) => {
      bar.width = 296 * value
    })

    this.add
      .text(width / 2, height / 2 - 40, 'Shinobi Valley', {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5)

    // TODO: load assets here
    // this.load.tilemapTiledJSON('village', '/assets/tilemaps/village.json')
    // this.load.spritesheet('player', '/assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 })
  }

  create() {
    this.scene.start('GameScene')
  }
}
