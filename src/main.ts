import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'
import { GameScene } from './scenes/GameScene'
import { TrainingGroundScene } from './scenes/TrainingGroundScene'
import { GrasslandScene } from './scenes/GrasslandScene'
import { RungTreScene } from './scenes/RungTreScene'
import { HangDongScene } from './scenes/HangDongScene'
import { NuiTuyetScene } from './scenes/NuiTuyetScene'
import { RungThiengScene } from './scenes/RungThiengScene'
import { RungCoScene } from './scenes/RungCoScene'
import { VillageScene } from './scenes/VillageScene'
import { EditorScene } from './scenes/EditorScene'
import { UIScene } from './scenes/UIScene'
import { combatManager } from './systems/CombatManager'
import { inventoryManager } from './systems/InventoryManager'
import { npcRelationshipManager } from './systems/NpcRelationshipManager'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  // Sky Mid theo art-refs/theme.md — chỉ thấy được ở khoảnh khắc trắng/loading trước khi PreloadScene vẽ
  // gradient của riêng nó, và trong GameScene thực tế thì ảnh nền luôn phủ kín canvas nên không lộ ra.
  backgroundColor: '#79C4FF',
  pixelArt: true,
  roundPixels: true,
  // `parent` bắt buộc phải có giá trị thì Phaser mới thực sự tạo DOM container dù `dom.createContainer` đã
  // bật (xem `node_modules/phaser/src/dom/CreateDOMContainer.js`: `if (!config.parent || !config.domCreateContainer) return`)
  // — trước đó thiếu dòng này khiến `this.add.dom()` ném lỗi "No DOM Container set in game config" dù config
  // đã set `dom.createContainer: true` (bug thật gặp khi verify bằng Puppeteer). Canvas vẫn append vào
  // `document.body` như trước (`index.html` không có wrapper div riêng), không đổi layout gì cả.
  parent: document.body,
  // Bật container DOM — cần cho 2 ô input số (từ ô # / đến ô #) ở bảng Công Cụ Nông Trại (`GameScene`), Phaser
  // không có text input dựng bằng Canvas/WebGL nên phải dùng input HTML thật đè lên canvas qua `this.add.dom()`.
  dom: { createContainer: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false }
  },
  scene: [
    BootScene,
    PreloadScene,
    GameScene,
    TrainingGroundScene,
    GrasslandScene,
    RungTreScene,
    HangDongScene,
    NuiTuyetScene,
    RungThiengScene,
    RungCoScene,
    VillageScene,
    UIScene,
    EditorScene
  ]
}

const game = new Phaser.Game(config)

// Chỉ tồn tại ở dev build (`import.meta.env.DEV`, Vite tự loại bỏ hẳn khối này khỏi bundle production qua dead
// code elimination) — cho phép `scripts/dev-check.cjs` (Puppeteer) đọc thẳng state scene/data lúc tự test thủ
// công, không cần thêm/xoá thủ công mỗi lần như trước.
if (import.meta.env.DEV) {
  ;(window as unknown as { __game: Phaser.Game }).__game = game
  // Singleton chiến đấu/túi đồ (Sprint 5) — expose thêm để `dev-check.cjs` verify EXP/gold/drop/HP thật mà
  // không cần đào qua registry/scene internals mỗi lần.
  ;(
    window as unknown as {
      __combatManager: typeof combatManager
      __inventoryManager: typeof inventoryManager
    }
  ).__combatManager = combatManager
  ;(
    window as unknown as {
      __combatManager: typeof combatManager
      __inventoryManager: typeof inventoryManager
    }
  ).__inventoryManager = inventoryManager
  // Sprint 10 — NPC/quan hệ, cùng lý do expose như 2 singleton trên.
  ;(
    window as unknown as { __npcRelationshipManager: typeof npcRelationshipManager }
  ).__npcRelationshipManager = npcRelationshipManager
}
