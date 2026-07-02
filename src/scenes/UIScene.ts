import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    // UI chạy song song với GameScene (không replace)
    // Placeholder HUD
    this.add.text(8, 8, 'HP: 500 / 500', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })

    this.add.text(8, 28, 'MP: 200 / 200', {
      fontSize: '14px',
      color: '#aaaaff',
      fontFamily: 'monospace'
    })

    this.add.text(8, 48, 'Lv. 1 | EXP: 0 / 100', {
      fontSize: '14px',
      color: '#ffff88',
      fontFamily: 'monospace'
    })
  }
}
