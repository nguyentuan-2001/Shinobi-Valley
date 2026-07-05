import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Load logo riêng ở BootScene (trước PreloadScene) để màn hình loading có logo hiển thị ngay từ đầu
    // thay vì phải đợi asset này tự load trong chính thanh loading mà nó thuộc về.
    this.load.image('game_logo', '/assets/ui/logo.png')
  }

  create() {
    this.scene.start('PreloadScene')
  }
}
