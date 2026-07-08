import Phaser from 'phaser'
import { initGameData, preloadGameData } from '../data/DataLoader'
import type { Gender } from '../entities/Player'

type ActionKey = 'idle_front' | 'walk_front' | 'walk_back' | 'walk_side' | 'attack'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    const { width, height } = this.scale

    // Nền gradient 3 điểm dừng Sky Top -> Sky Mid -> Sky Horizon (đúng cả 3 màu sky trong art-refs/theme.md)
    // thay cho màu phẳng tối cũ. Dùng canvas gradient (createLinearGradient) thay vì Graphics.fillGradientStyle
    // vì hàm đó chỉ nội suy thẳng giữa 2 màu ở 2 đầu — không lên được gradient 3 màu nhìn rõ rệt như dải trời thật.
    const skyTexture = this.textures.createCanvas('preload_sky', width, height)
    if (skyTexture) {
      const ctx = skyTexture.getContext()
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#5CAEF8') // Sky Top
      gradient.addColorStop(0.55, '#79C4FF') // Sky Mid
      gradient.addColorStop(1, '#B7E2FF') // Sky Horizon
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      skyTexture.refresh()
      this.add.image(0, 0, 'preload_sky').setOrigin(0, 0)
    }

    // Logo (đã load sẵn ở BootScene) thay cho chữ "Shinobi Valley" — logo gốc 1254x1254, thu nhỏ vừa nửa trên
    // màn hình loading, chừa chỗ bên dưới cho spinner.
    const logo = this.add.image(width / 2, height * 0.4, 'game_logo')
    logo.setScale((height * 0.55) / logo.height)

    // Spinner xoay tròn thay cho progress bar cũ — bar cũ tính `width = 296 * value` theo % tải, nhưng lộ lỗi
    // vượt khung viền (nghi do giá trị `value` từ event 'progress' không tuyến tính/vượt 1 khi nhiều loader
    // chạy song song). Spinner không cần đồng bộ theo %, chỉ cần báo "đang tải" nên né hẳn được lỗi này.
    const spinner = this.add.graphics().setPosition(width / 2, height * 0.82)
    spinner
      .lineStyle(6, 0xffffff, 0.3)
      .beginPath()
      .arc(0, 0, 22, 0, Math.PI * 2)
      .strokePath()
    spinner
      .lineStyle(6, 0xffd963, 1)
      .beginPath()
      .arc(0, 0, 22, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(180), false)
      .strokePath()
    this.tweens.add({ targets: spinner, angle: 360, duration: 900, repeat: -1, ease: 'Linear' })

    preloadGameData(this)

    // Nền map Farm dùng thẳng ảnh minh hoạ toàn cảnh (nhà/luống đất/giếng/chuồng đã vẽ sẵn) thay vì ghép tile —
    // xem lý do ở docs/planning/progress.md (mục Y-sort/2.5D, quyết định đổi sang nền tĩnh).
    this.load.image('farm_background', '/assets/tilesets/farm/BaseMap.png')
    // Bản đêm cùng bố cục/kích thước hệt bản ngày (đã verify 1672x941 khớp) — GameScene crossfade dần sang ảnh
    // này theo % đêm của TimeManager (không bật/tắt đột ngột), xem GameScene.updateDayNightVisuals().
    this.load.image('farm_background_night', '/assets/tilesets/farm/BaseMap_night.png')

    // 3 trạng thái ô đất trồng cây — xem vị trí đặt ở data/farmTiles.ts. `soil_tilled` giờ đã dùng thật (đổi
    // texture khi cuốc đất, xem GameScene.syncFarmVisuals) — Sprint 2.
    this.load.image('farm_soil_untilled', '/assets/tilesets/farm/soil_untilled.png')
    this.load.image('farm_soil_tilled', '/assets/tilesets/farm/soil_tilled.png')
    this.load.image('farm_soil_water_pot', '/assets/tilesets/farm/soil_water_pot.png')

    // Sprite cây trồng — đủ 20 cây trong crops.json (khớp `GameScene.PLANTABLE_CROP_IDS`), mỗi cây 4 giai đoạn
    // hiển thị trên map (seed/sprout/growing/harvest — harvest = cây chín còn trên đất, load riêng file
    // `<id>_harvest.png`). Load thêm key `crop_<id>_item` từ `<id>.png` (item icon) — dùng cho hiệu ứng bay
    // lên khi thu hoạch (xem GameScene.playHarvestFx()); Inventory UI thật (hiện icon trong túi đồ) vẫn để
    // Sprint 4. `natures_essence` trước đây bị loại vì tưởng craft-only, giờ trồng được như thường (xem
    // GameScene.PLANTABLE_CROP_IDS + docs/planning/progress.md).
    // Key texture theo mẫu `crop_<id>_<stage>` để GameScene tra cứu động (xem FarmManager.getVisualStage()).
    const PLANTABLE_CROPS = [
      'green_onion',
      'carrot',
      'potato',
      'cabbage',
      'pumpkin',
      'mushroom',
      'strawberry',
      'tomato',
      'corn',
      'watermelon',
      'medicinal_herb',
      'green_tea',
      'lotus',
      'ginseng',
      'red_ginseng',
      'sunflower',
      'moonlight_flower',
      'spirit_energy_plant',
      'ancient_seed',
      'natures_essence'
    ] as const
    const CROP_STAGE_SUFFIX: Record<string, string> = {
      seed: '_seed',
      sprout: '_sprout',
      growing: '_growing',
      harvest: '_harvest'
    }
    for (const cropId of PLANTABLE_CROPS) {
      for (const [stage, suffix] of Object.entries(CROP_STAGE_SUFFIX)) {
        this.load.image(`crop_${cropId}_${stage}`, `/assets/sprites/crops/${cropId}${suffix}.png`)
      }
      this.load.image(`crop_${cropId}_item`, `/assets/sprites/crops/${cropId}.png`)
    }

    // Hàng rào gỗ bao quanh khu đất — xem vị trí đặt ở data/fencePlacements.ts.
    this.load.image('fence_horizontal', '/assets/tilesets/farm/fence_horizontal.png')
    this.load.image('fence_vertical', '/assets/tilesets/farm/fence_vertical.png')

    // Nhà chính người chơi, 3 cấp độ (xem art-refs/world/buildings.md + docs/gameplay/economy.md). Chỉ cấp 1
    // được đặt lên map ngay từ đầu (data/housePlacement.ts) — cấp 2/3 preload sẵn, hiển thị sau khi có logic
    // nâng cấp nhà (đổi texture theo level khi trả tiền), tương tự cách `tilled` farm tile đang chờ Sprint 2.
    this.load.image('player_house_1', '/assets/sprites/buildings/player_house_1.png')
    this.load.image('player_house_2', '/assets/sprites/buildings/player_house_2.png')
    this.load.image('player_house_3', '/assets/sprites/buildings/player_house_3.png')

    // Kích thước frame khác nhau theo giới tính/hành động vì asset gen ở nhiều đợt khác nhau
    // (men còn bộ cũ 3-4 frame 164x213, women đã có bộ mới 8 frame cho toàn bộ hành động — xem asset-manifest.md).
    const frameSizes: Record<
      Gender,
      Record<ActionKey, { frameWidth: number; frameHeight: number }>
    > = {
      men: {
        idle_front: { frameWidth: 164, frameHeight: 213 },
        walk_front: { frameWidth: 164, frameHeight: 213 },
        walk_back: { frameWidth: 164, frameHeight: 213 },
        walk_side: { frameWidth: 164, frameHeight: 213 },
        attack: { frameWidth: 164, frameHeight: 213 }
      },
      women: {
        idle_front: { frameWidth: 162, frameHeight: 334 },
        walk_front: { frameWidth: 162, frameHeight: 334 },
        walk_back: { frameWidth: 162, frameHeight: 334 },
        walk_side: { frameWidth: 162, frameHeight: 334 },
        attack: { frameWidth: 170, frameHeight: 335 }
      }
    }

    for (const gender of ['men', 'women'] as const) {
      const base = `/assets/sprites/player/${gender}`
      for (const action of [
        'idle_front',
        'walk_front',
        'walk_back',
        'walk_side',
        'attack'
      ] as const) {
        this.load.spritesheet(
          `player_${gender}_${action}`,
          `${base}/${action}_strip.png`,
          frameSizes[gender][action]
        )
      }
    }
  }

  create() {
    initGameData(this)
    console.log('[PreloadScene] Data đã nạp:', {
      crops: this.cache.json.get('crops'),
      items: this.cache.json.get('items'),
      weapons: this.cache.json.get('weapons'),
      armor: this.cache.json.get('armor'),
      skills: this.cache.json.get('skills'),
      monsters: this.cache.json.get('monsters'),
      npcs: this.cache.json.get('npcs'),
      quests: this.cache.json.get('quests'),
      recipes: this.cache.json.get('recipes'),
      fish: this.cache.json.get('fish'),
      professions: this.cache.json.get('professions'),
      gacha: this.cache.json.get('gacha'),
      events: this.cache.json.get('events')
    })

    this.scene.start('GameScene')
  }
}
