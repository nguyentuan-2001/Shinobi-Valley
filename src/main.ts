import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'
import { GameScene } from './scenes/GameScene'
import { EditorScene } from './scenes/EditorScene'
import { UIScene } from './scenes/UIScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  // Sky Mid theo art-refs/theme.md — chỉ thấy được ở khoảnh khắc trắng/loading trước khi PreloadScene vẽ
  // gradient của riêng nó, và trong GameScene thực tế thì ảnh nền luôn phủ kín canvas nên không lộ ra.
  backgroundColor: '#79C4FF',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false }
  },
  scene: [BootScene, PreloadScene, GameScene, UIScene, EditorScene]
}

const game = new Phaser.Game(config)

// Chỉ tồn tại ở dev build (`import.meta.env.DEV`, Vite tự loại bỏ hẳn khối này khỏi bundle production qua dead
// code elimination) — cho phép `scripts/dev-check.cjs` (Puppeteer) đọc thẳng state scene/data lúc tự test thủ
// công, không cần thêm/xoá thủ công mỗi lần như trước.
if (import.meta.env.DEV) {
  ;(window as unknown as { __game: Phaser.Game }).__game = game
}
