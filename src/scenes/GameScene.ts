import Phaser from 'phaser'

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const { width, height } = this.scale

    // Placeholder — sẽ thay bằng tilemap thật
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a3a2a)

    this.add.text(width / 2, height / 2, 'GameScene đang phát triển...', {
      fontSize: '18px',
      color: '#aaffaa',
      fontFamily: 'monospace'
    }).setOrigin(0.5)

    // Khởi động UI overlay
    this.scene.launch('UIScene')
  }
}
