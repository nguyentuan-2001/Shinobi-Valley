import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { FARM_COLLISION_ZONES } from '../data/collisionZones'
import { FARM_TILE_PLACEMENTS, type FarmTileType } from '../data/farmTiles'
import { FENCE_PLACEMENTS } from '../data/fencePlacements'
import { PLAYER_HOUSE, HOUSE_LEVEL_TEXTURES } from '../data/housePlacement'
import { FarmManager, type CropVisualStage, type FarmTileRuntime } from '../systems/FarmManager'
import { TimeManager } from '../systems/TimeManager'
import { resolvePolygonCollision } from '../systems/CollisionUtils'
import { GameData } from '../data/DataLoader'

/** Nền luôn ở dưới cùng, không tham gia Y-sort với player/prop khác (xem hàm depth ở Player.ts). */
const GROUND_DEPTH = -10000
/** Ô đất trồng cây nằm ngay trên nền nhưng luôn dưới player/shadow (player depth = y, luôn > 0 trong map này). */
const FARM_TILE_DEPTH = -1
/** Cây trồng vẽ ngay trên lớp đất — vẫn thấp hơn player (player depth = y luôn > 0), không cần Y-sort riêng
 * vì cây coi như nằm phẳng trên mặt đất giống ô đất, không có chiều cao để player đi "sau" nó. */
const CROP_DEPTH = FARM_TILE_DEPTH + 0.2
const SHADOW_TEXTURE = 'shadow_oval'
const INTERACTION_POINTER_TEXTURE = 'interaction_pointer'
/** Luôn vẽ trên cùng — con trỏ là chỉ dẫn UI gắn vào world, phải nổi trên mọi prop (nhà, hàng rào, cây...). */
const INTERACTION_POINTER_DEPTH = 999_999
/** Icon bay lên khi thu hoạch phải nổi TRÊN cả con trỏ tương tác — ô vừa hái vẫn còn trong bán kính tương tác
 * (đất chưa cuốc lại), nên con trỏ tiếp tục hiện đúng ngay tại đó cùng lúc; nếu thấp hơn depth con trỏ, hình
 * thoi vàng của con trỏ (22×26, gần kín trọn icon 24×24) sẽ che mất icon suốt lúc bay lên (bug thật gặp khi
 * verify bằng Puppeteer — object tồn tại đúng vị trí/alpha nhưng không thấy gì trong screenshot). */
const HARVEST_FX_DEPTH = INTERACTION_POINTER_DEPTH + 0.5
/** Menu chọn hạt giống phải nổi trên cả con trỏ tương tác. */
const SEED_MENU_DEPTH = 1_000_000
const BACKGROUND_KEY = 'farm_background'
const BACKGROUND_NIGHT_KEY = 'farm_background_night'
const FARM_TILE_TEXTURES: Record<FarmTileType, string> = {
  untilled: 'farm_soil_untilled',
  tilled: 'farm_soil_tilled',
  water_pot: 'farm_soil_water_pot'
}
/** `soil_tilled.png` (221x221) và `soil_untilled.png` (134x134) có tỉ lệ viền cỏ/đất khác hẳn nhau — đo bằng
 * lát cắt pixel ngang giữa ảnh: untilled viền ~6.7%/cạnh (đất chiếm ~87% ảnh), tilled viền chỉ ~2.7%/cạnh (đất
 * chiếm ~95%). Hiển thị cùng 1 kích thước ô y hệt thì phần đất của tilled trông "to hơn hẳn" vì viền mỏng hơn
 * nhiều (bug thật user báo). Bù lại bằng cách thu nhỏ nhẹ kích thước hiển thị của tilled (~87/95 ≈ 91.5%) để
 * phần đất 2 trạng thái to bằng mắt tương đương nhau lúc cuốc — đổi lại ảnh gốc sau này thì cần đo lại tỉ lệ. */
const SOIL_TEXTURE_DISPLAY_SCALE: Partial<Record<string, number>> = {
  farm_soil_tilled: 0.915
}
/** Bán kính (px world) tính là "đứng gần" 1 ô đất — dùng cho cả con trỏ báo lẫn tương tác Enter thật, để 2 chỗ
 * luôn khớp nhau. Trước đây phải đứng chính xác lên trên ô (~10.5px, nửa cellWidth) mới tính, user phản hồi
 * khó dùng vì ô khá nhỏ — tăng lên rộng hơn hẳn kích thước 1 ô (21px) để đứng cạnh ô cũng trỏ/tương tác được. */
const FARM_TILE_INTERACT_RADIUS = 32

/** Toàn bộ 19 cây trong `crops.json` — chọn qua menu hạt giống (mở khi Enter lên ô đã cuốc). Chưa có
 * inventory/tiền/mở khoá theo level thật (đó là việc của Sprint 4) nên danh sách này coi như "có sẵn tất cả,
 * miễn phí" — kể cả cây Tier Cao Cấp/Hiếm đáng lẽ phải mở khoá theo `unlock_level` hoặc chỉ có qua drop
 * (`seed_cost: 0` trong data). Không lọc theo tier ở đây vì chưa có gì để lọc dựa vào (chưa có level người
 * chơi) — làm ngay bây giờ dễ tạo cảm giác sai "đã unlock" mà thực ra chỉ là chưa có cơ chế chặn. */
const PLANTABLE_CROP_IDS = [
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
  'ancient_seed'
] as const
/** Menu hạt giống chỉ hiện 1 "cửa sổ" trượt gồm chừng này ô cùng lúc (không phải cả 19 icon nhồi 1 hàng) — số
 * lẻ để ô đang chọn luôn nằm giữa. Bề rộng bảng tính theo số này, không theo tổng số cây, nên thêm/bớt cây
 * trong `crops.json` sau này không làm bảng phình to thêm. */
const SEED_MENU_VISIBLE_SLOTS = 7

export class GameScene extends Phaser.Scene {
  private player!: Player
  private collisionPolygons: Phaser.Geom.Polygon[] = []
  private farmManager!: FarmManager
  /** Ảnh đất (untilled/tilled) của từng ô, theo `FarmTilePlacement.id` — cần giữ lại để đổi texture khi cuốc. */
  private readonly soilImages = new Map<number, Phaser.GameObjects.Image>()
  /** Ảnh cây trồng trên từng ô đang có cây (tạo khi gieo, xoá khi ô hết cây) — key cũng là `FarmTilePlacement.id`. */
  private readonly cropImages = new Map<number, Phaser.GameObjects.Image>()
  private selectedCropId: string = PLANTABLE_CROP_IDS[1]
  /** Mũi tên báo "khối đang tương tác được" (ô đất dưới chân, nhà khi đứng gần...) — xem `updateInteractionPointer()`. */
  private interactionPointer!: Phaser.GameObjects.Image
  private timeManager!: TimeManager
  /** Lớp phủ tối ban đêm — hình chữ nhật cố định theo camera (`setScrollFactor(0)`), chỉ đổi alpha, không phải
   * world object nên không cần theo dõi vị trí camera thủ công. */
  private nightOverlay!: Phaser.GameObjects.Rectangle
  /** Ảnh nền ban đêm (cùng bố cục/kích thước ảnh nền ngày), đặt chồng lên trên — hiện dần bằng alpha theo
   * `TimeManager.getNightFraction()` thay vì bật/tắt đột ngột, xem `updateDayNightVisuals()`. */
  private backgroundNight!: Phaser.GameObjects.Image
  /** Menu chọn hạt giống (mở khi Enter lên ô đã cuốc) — xem `openSeedMenu()`/`confirmSeedMenu()`. Player đứng
   * yên trong lúc menu mở (xem `update()`), điều hướng bằng ←/→, Enter xác nhận trồng, Esc huỷ. */
  private seedMenuOpen = false
  private seedMenuIndex = 0
  private seedMenuTargetTileId: number | null = null
  private seedMenuContainer!: Phaser.GameObjects.Container
  private seedMenuIcons: Phaser.GameObjects.Image[] = []
  private seedMenuHighlight!: Phaser.GameObjects.Rectangle
  private seedMenuLabel!: Phaser.GameObjects.Text
  /** Mũi tên báo còn hạt ở bên trái/phải "cửa sổ" đang hiện — ẩn khi đã ở đầu/cuối danh sách 19 cây. */
  private seedMenuArrowLeft!: Phaser.GameObjects.Text
  private seedMenuArrowRight!: Phaser.GameObjects.Text
  /** Kích thước icon cố định (px) — phải áp lại bằng `setDisplaySize()` mỗi lần `setTexture()` đổi icon sang
   * cây khác, vì các ảnh `crop_<id>_ready` có kích thước GỐC khác hẳn nhau giữa các cây (không đồng bộ), đổi
   * texture không tự giữ nguyên display size cũ — quên bước này khiến icon to nhỏ lộn xộn, có cây gần như biến
   * mất (bug thật đã gặp khi test menu với đủ 19 cây thay vì chỉ 3 cây cùng cỡ như trước). */
  private seedMenuIconSize = 32
  /** Kích thước bảng thật (tính động theo số hạt, xem `createSeedMenu()`) — cần lưu lại để so bằng con trỏ
   * chuột lúc click ra ngoài đóng menu, xem `isPointerInsideSeedMenu()`. */
  private seedMenuPanelWidth = 0
  private seedMenuPanelHeight = 0

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.createShadowTexture()
    this.createInteractionPointerTexture()
    this.interactionPointer = this.add
      .image(0, 0, INTERACTION_POINTER_TEXTURE)
      .setDepth(INTERACTION_POINTER_DEPTH)
      .setVisible(false)
    this.createSeedMenu()

    // Nền map dùng thẳng ảnh minh hoạ toàn cảnh (đồng cỏ + đường mòn chia lô + suối/thác/ao đã vẽ sẵn) thay vì
    // ghép tile — xem lý do đổi từ tile-grid sang ảnh tĩnh ở docs/planning/progress.md. Cố tình không hardcode
    // kích thước ảnh (đã đổi nhiều lần khi user thay ảnh gốc) — luôn đọc động qua displayWidth/displayHeight.
    // Nếu ảnh nền có lúc nhỏ hơn khung nhìn game ở chiều nào đó thì cần thêm lại setScale() để lấp viền tối
    // (xem lịch sử BACKGROUND_SCALE trong progress.md) — hiện tại các ảnh đã dùng đều lớn hơn khung nhìn.
    const background = this.add.image(0, 0, BACKGROUND_KEY).setOrigin(0, 0).setDepth(GROUND_DEPTH)

    // Bản đêm chồng ngay trên bản ngày, cùng gốc/kích thước (đã verify 1672x941 khớp cả 2 ảnh) — chỉ đổi alpha
    // theo % đêm nên không cần offset/scale riêng, và mọi toạ độ va chạm/ô đất/hàng rào/nhà vẫn đúng nguyên vì
    // chúng tính theo world-space chung, không phụ thuộc ảnh nền nào đang hiện.
    this.backgroundNight = this.add
      .image(0, 0, BACKGROUND_NIGHT_KEY)
      .setOrigin(0, 0)
      .setDepth(GROUND_DEPTH + 1)
      .setAlpha(0)

    // Mặc định physics world bounds lấy theo kích thước game config chứ không tự khớp theo ảnh nền — nếu không
    // set lại, player sẽ bị chặn cứng ở góc trên-trái map dù ảnh nền thật lớn hơn nhiều, khiến va chạm sông/ao
    // phía xa không bao giờ test được vì player còn chưa đi tới nơi (bug thật đã gặp, xem progress.md).
    this.physics.world.setBounds(0, 0, background.displayWidth, background.displayHeight)

    // Vùng chặn giờ là đa giác tuỳ ý (xem data/collisionZones.ts + EditorScene) — Arcade Physics không hỗ trợ
    // polygon body nên không dùng physics.add.collider được nữa, thay vào đó tự kiểm tra điểm-trong-đa-giác
    // thủ công mỗi frame ở checkPolygonCollisions().
    this.collisionPolygons = FARM_COLLISION_ZONES.map(
      (zone) => new Phaser.Geom.Polygon(zone.points)
    )

    // Sprint 2 — cuốc đất/trồng cây/lớn theo thời gian. FarmManager chỉ quản lý STATE (không đụng rendering),
    // phải khởi tạo sau placeFarmTiles() vì placeFarmTiles() tạo soilImages map mà syncFarmVisuals() cần.
    this.placeFarmTiles()
    this.farmManager = new FarmManager(FARM_TILE_PLACEMENTS)
    this.placeFence()
    this.placeHouse()

    // Sprint 3 — đồng hồ trong game (tách biệt hoàn toàn với giờ THỰC dùng để lớn cây ở FarmManager, xem
    // comment trong TimeManager.ts). Overlay tối phủ theo camera (scrollFactor 0), không phải world object.
    this.timeManager = new TimeManager()
    this.nightOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x0a1a3f)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(INTERACTION_POINTER_DEPTH - 1)
      .setAlpha(this.timeManager.getNightOverlayAlpha())

    this.player = new Player(this, 890, 430, 'women')

    this.cameras.main.setBounds(0, 0, background.displayWidth, background.displayHeight)
    this.cameras.main.startFollow(this.player, true)

    // selectSeed()/updateTimeHud() ghi vào registry TRƯỚC khi launch UIScene — để UIScene.create() đọc registry
    // lần đầu đã có sẵn giá trị đúng, không cần chờ event 'changedata' bắn ra mới hiện chữ.
    this.selectSeed(this.selectedCropId)
    this.updateTimeHud()
    this.scene.launch('UIScene')

    // Q mở công cụ chỉnh tay vùng va chạm (EditorScene) — xem src/scenes/EditorScene.ts
    this.input.keyboard!.on('keydown-Q', (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      this.scene.stop('UIScene')
      this.scene.start('EditorScene')
    })

    // Enter: cuốc đất (empty->tilled) HOẶC mở/xác nhận menu chọn hạt giống — 1 phím, 3 nấc tuỳ trạng thái ô:
    // ô trống -> cuốc; ô đã cuốc (kể cả vừa cuốc xong ở nấc trước, hoặc đã cuốc sẵn từ trước) -> mở menu; menu
    // đang mở -> xác nhận hạt đang chọn rồi trồng. Xem `interactWithFarmTile()`.
    this.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      this.interactWithFarmTile()
    })

    // ←/→ CHỈ điều hướng menu hạt giống khi đang mở — không đụng gì tới di chuyển player vì player đã bị đứng
    // yên hoàn toàn lúc menu mở (skip Player.update() ở update()), không đọc cursors nữa.
    this.input.keyboard!.on('keydown-LEFT', (event: KeyboardEvent) => {
      if (!this.seedMenuOpen || event.repeat) return
      event.preventDefault()
      this.moveSeedMenuSelection(-1)
    })
    this.input.keyboard!.on('keydown-RIGHT', (event: KeyboardEvent) => {
      if (!this.seedMenuOpen || event.repeat) return
      event.preventDefault()
      this.moveSeedMenuSelection(1)
    })

    // Esc: đóng menu hạt giống mà không trồng gì (không có lối thoát nào khác một khi đã mở menu).
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      if (!this.seedMenuOpen || event.repeat) return
      event.preventDefault()
      this.closeSeedMenu()
    })

    // Click ra ngoài bảng khi menu hạt giống đang mở = đóng menu (không trồng gì) — cùng hành vi với Esc, chỉ
    // khác cách kích hoạt. `pointer.x/y` là toạ độ canvas, so trực tiếp được với vị trí `seedMenuContainer` vì
    // container đó `setScrollFactor(0)` (cố định theo camera, không lệch theo world scroll).
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.seedMenuOpen && !this.isPointerInsideSeedMenu(pointer)) {
        this.closeSeedMenu()
      }
    })

    // DEBUG: phím G đẩy nhanh thời gian TRỒNG CÂY lên +1 giờ giả lập mỗi lần bấm. Cây lớn theo giờ THỰC trôi
    // qua (đúng thiết kế farming.md) — cố tình KHÔNG ăn theo đồng hồ game (TimeManager) ở dưới, nên phím G vẫn
    // cần thiết dù đã có game clock, không phải hàng tạm chờ Sprint 3 xong là bỏ.
    // `event.repeat` guard ở mọi phím tắt dạng "1 lần bấm = 1 hành động" trong file này — không có nó, giữ phím
    // hơi lâu (hoặc auto-repeat của OS/trình duyệt) sẽ bắn hành động lặp lại nhiều lần ngoài ý muốn (bug thật
    // đã gặp khi test phím T bằng Puppeteer: 1 lần bấm log ra tận 4 lần +1h).
    this.input.keyboard!.on('keydown-G', (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      this.farmManager.debugFastForward(1)
      console.log('[debug] farm fast-forward +1h')
    })

    // DEBUG: phím T đẩy nhanh ĐỒNG HỒ GAME lên +1 giờ giả lập mỗi lần bấm — test chu kỳ ngày/đêm không phải
    // chờ thật (mỗi giờ game = 60 giây thực, xem TimeManager.ts).
    this.input.keyboard!.on('keydown-T', (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      this.timeManager.debugAdvanceHours(1)
      console.log(
        `[debug] time fast-forward +1h -> ${this.timeManager.getTimeString()} ngày ${this.timeManager.getDay()}`
      )
    })

    // Debug: click vào map log toạ độ world (x,y) ra console — tiện dò toạ độ khi viết collisionZones.ts/
    // farmTiles.ts mà không cần mở EditorScene.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      console.log(`🚀 [GameScene] click x=${Math.round(world.x)} y=${Math.round(world.y)}`)
    })
  }

  update(_time: number, delta: number) {
    // Đứng yên hoàn toàn khi menu hạt giống đang mở (giống game farming tham khảo) — không gọi player.update()
    // nên cursors ←/→ (đang dùng để điều hướng menu) không vô tình làm player di chuyển theo.
    if (!this.seedMenuOpen) {
      this.player.update()
      this.checkPolygonCollisions(delta)
    }
    this.farmManager.update(Date.now())
    this.syncFarmVisuals()
    this.updateInteractionPointer()
    this.timeManager.update(delta)
    this.updateDayNightVisuals()
    this.updateTimeHud()
  }

  /** Đồng bộ mọi hiệu ứng ngày/đêm theo cùng 1 mốc `getNightFraction()` (0-1) — ảnh nền đêm hiện dần bằng alpha
   * (crossfade lên trên ảnh ngày), lớp phủ tối phủ lên player/prop (chưa có bản vẽ đêm riêng cho chúng). Dùng
   * chung 1 nguồn % thay vì mỗi chỗ tự tính để không lệch nhịp chuyển cảnh giữa 2 hiệu ứng. */
  private updateDayNightVisuals() {
    this.backgroundNight.setAlpha(this.timeManager.getNightFraction())
    this.nightOverlay.setAlpha(this.timeManager.getNightOverlayAlpha())
  }

  /** Ghi ngày/giờ hiện tại vào registry cho UIScene đọc — xem cách làm tương tự ở `selectSeed()`. */
  private updateTimeHud() {
    this.registry.set(
      'gameTimeText',
      `Ngày ${this.timeManager.getDay()} — ${this.timeManager.getTimeString()}`
    )
  }

  /** Arcade Physics không hỗ trợ collider dạng polygon — tự chặn thủ công, xem `systems/CollisionUtils.ts`
   * (dùng chung với `EditorScene`) để biết chi tiết + bug mũi nhọn lõm đã sửa. */
  private checkPolygonCollisions(delta: number) {
    resolvePolygonCollision(this.player, this.collisionPolygons, delta)
  }

  /** Đặt các ô đất trồng cây lên 4 thảm cỏ mở (3 thảm trên dạng luống cày cho ô chưa cuốc, 1 thảm dưới cho
   * 12 ô chậu nước) — toạ độ tính sẵn trong `data/farmTiles.ts`. Ô `untilled` giữ lại reference vào
   * `soilImages` (theo `id`) để `syncFarmVisuals()` đổi texture khi cuốc đất — ô `water_pot` chưa có tương
   * tác nên không cần giữ. */
  private placeFarmTiles() {
    for (const tile of FARM_TILE_PLACEMENTS) {
      const textureKey = FARM_TILE_TEXTURES[tile.type]
      const scale = SOIL_TEXTURE_DISPLAY_SCALE[textureKey] ?? 1
      const image = this.add
        .image(tile.x, tile.y, textureKey)
        .setDisplaySize(tile.width * scale, tile.height * scale)
        .setDepth(FARM_TILE_DEPTH)
      if (tile.type === 'untilled') this.soilImages.set(tile.id, image)
    }
  }

  /** Tìm "khối" gần player nhất để báo bằng con trỏ — ưu tiên ô đất gần nhất trong bán kính
   * `FARM_TILE_INTERACT_RADIUS` (khớp đúng ô mà Enter sẽ tác động, không cần đứng chính xác lên trên), sau đó
   * tới nhà nếu đứng đủ gần (nhà chưa có tương tác thật nào, nhưng vẫn báo trước để dễ mở rộng sau này, đúng
   * yêu cầu "gần nhà thì trỏ vào nhà"). Trả về toạ độ MÉP TRÊN của khối (chỗ mũi tên sẽ trỏ xuống) hoặc `null`
   * nếu không có gì gần để báo. */
  private findInteractionTarget(): { x: number; y: number } | null {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const feetX = body.center.x
    const feetY = body.bottom

    const tile = this.farmManager.findNearestTile(feetX, feetY, FARM_TILE_INTERACT_RADIUS)
    if (tile) return { x: tile.x, y: tile.y - tile.height / 2 }

    const houseRadius = PLAYER_HOUSE.width * 0.7
    if (
      Phaser.Math.Distance.Between(feetX, feetY, PLAYER_HOUSE.x, PLAYER_HOUSE.bottomY) < houseRadius
    ) {
      return { x: PLAYER_HOUSE.x, y: PLAYER_HOUSE.y - PLAYER_HOUSE.height / 2 }
    }

    return null
  }

  /** Gọi mỗi frame — hiện/ẩn + di chuyển con trỏ theo khối gần nhất tìm được ở `findInteractionTarget()`, thêm
   * hiệu ứng nhấp nhô nhẹ (sin theo thời gian) cho đỡ trông như dán tĩnh 1 chỗ. */
  private updateInteractionPointer() {
    const target = this.findInteractionTarget()
    if (!target) {
      this.interactionPointer.setVisible(false)
      return
    }
    const bounce = Math.sin(this.time.now / 180) * 3
    this.interactionPointer.setPosition(target.x, target.y - 6 + bounce).setVisible(true)
  }

  /** Enter bấm khi menu đang mở = xác nhận hạt đang chọn rồi trồng. Enter bấm khi KHÔNG có menu = tìm ô đất
   * GẦN NHẤT trong bán kính `FARM_TILE_INTERACT_RADIUS` (cùng điểm chân player dùng cho va chạm polygon:
   * `body.center.x`, `body.bottom` — và cùng bán kính dùng cho con trỏ báo, nên "thấy trỏ" luôn đi kèm "bấm
   * được") rồi cuốc đất (`empty`), mở menu chọn hạt (`tilled`), hoặc thu hoạch (`ready`) — không làm gì nếu
   * không có ô nào đủ gần, hoặc ô còn `planted` (chưa chín). */
  private interactWithFarmTile() {
    if (this.seedMenuOpen) {
      this.confirmSeedMenu()
      return
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const tile = this.farmManager.findNearestTile(
      body.center.x,
      body.bottom,
      FARM_TILE_INTERACT_RADIUS
    )
    if (!tile) return

    if (tile.state === 'empty') {
      this.farmManager.till(tile)
    } else if (tile.state === 'tilled') {
      this.openSeedMenu(tile)
    } else if (tile.state === 'ready') {
      const cropId = this.farmManager.harvest(tile)
      if (cropId) this.playHarvestFx(cropId, tile.x, tile.y)
    }
  }

  /** Hiệu ứng thu hoạch: icon vật phẩm (item icon, khác sprite `harvest` còn trên đất) hiện tại đúng vị trí ô
   * vừa hái, bay lên 1 đoạn ngắn rồi mờ dần và biến mất — chỉ là phản hồi hình ảnh tức thời, CHƯA cộng vào
   * inventory thật (Inventory là việc của Sprint 4, hiện chưa tồn tại để cộng vào). */
  private playHarvestFx(cropId: string, x: number, y: number) {
    const icon = this.add
      .image(x, y, this.cropItemTextureKey(cropId))
      .setDisplaySize(24, 24)
      .setDepth(HARVEST_FX_DEPTH)
    this.tweens.add({
      targets: icon,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => icon.destroy()
    })
  }

  /** Mở menu chọn hạt giống lên 1 ô đã cuốc — nhớ lại ô mục tiêu (`seedMenuTargetTileId`) để `confirmSeedMenu()`
   * biết trồng vào đâu, khởi điểm menu ở đúng hạt đang chọn gần nhất (`selectedCropId`) cho liền mạch, và đứng
   * yên player (huỷ vận tốc hiện có — nếu đang đi mà mở menu, không huỷ thì player trôi tiếp theo quán tính cũ
   * dù `update()` đã ngừng gọi `player.update()`). */
  private openSeedMenu(tile: FarmTileRuntime) {
    this.seedMenuOpen = true
    this.seedMenuTargetTileId = tile.id
    const startIndex = PLANTABLE_CROP_IDS.indexOf(
      this.selectedCropId as (typeof PLANTABLE_CROP_IDS)[number]
    )
    this.seedMenuIndex = startIndex >= 0 ? startIndex : 0
    this.updateSeedMenuSelection()
    this.seedMenuContainer.setVisible(true)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  private closeSeedMenu() {
    this.seedMenuOpen = false
    this.seedMenuTargetTileId = null
    this.seedMenuContainer.setVisible(false)
  }

  private moveSeedMenuSelection(direction: -1 | 1) {
    const count = PLANTABLE_CROP_IDS.length
    this.seedMenuIndex = (this.seedMenuIndex + direction + count) % count
    this.updateSeedMenuSelection()
  }

  /** Trồng đúng hạt đang được chọn (viền vàng) trong menu vào ô mục tiêu đã nhớ lúc mở menu, rồi đóng menu.
   * Cũng đồng bộ `selectedCropId`/HUD luôn — lần sau mở menu sẽ khởi điểm ở đúng hạt vừa trồng. */
  private confirmSeedMenu() {
    const cropId = PLANTABLE_CROP_IDS[this.seedMenuIndex]
    this.selectSeed(cropId)
    const tile = this.farmManager.getTiles().find((t) => t.id === this.seedMenuTargetTileId)
    if (tile) this.farmManager.plant(tile, cropId)
    this.closeSeedMenu()
  }

  /** Đổi hạt giống đang chọn (gọi khi xác nhận trong menu), đồng thời cập nhật tên hiển thị ở UIScene qua
   * registry dùng chung (`this.registry` là DataManager toàn cục, mọi scene đọc/ghi chung 1 chỗ). */
  private selectSeed(cropId: string) {
    this.selectedCropId = cropId
    const crop = GameData.crops.find((c) => c.id === cropId)
    this.registry.set('selectedSeedName', crop?.name ?? cropId)
  }

  /** Tính điểm bắt đầu "cửa sổ" hiện icon — canh giữa `seedMenuIndex`, kẹp trong khoảng [0, tổng - số ô hiện]
   * để không bao giờ hở icon rỗng ở 2 đầu danh sách (trừ khi tổng cây ít hơn cả số ô hiện, lúc đó luôn về 0). */
  private getSeedMenuWindowStart(): number {
    const total = PLANTABLE_CROP_IDS.length
    if (total <= SEED_MENU_VISIBLE_SLOTS) return 0
    const centered = this.seedMenuIndex - Math.floor(SEED_MENU_VISIBLE_SLOTS / 2)
    return Phaser.Math.Clamp(centered, 0, total - SEED_MENU_VISIBLE_SLOTS)
  }

  /** Cập nhật tên hạt + số thứ tự + đổi texture từng icon trong "cửa sổ" đang hiện + vị trí viền vàng highlight
   * theo `seedMenuIndex` hiện tại — gọi khi mở menu hoặc đổi lựa chọn bằng ←/→. Phải đổi texture icon mỗi lần
   * (không chỉ di chuyển highlight như bản 3-cây cũ) vì giờ danh sách 19 cây dài hơn số ô hiện cùng lúc
   * (`SEED_MENU_VISIBLE_SLOTS`), icon phải "trượt" theo cửa sổ thay vì đứng yên 1 chỗ. */
  private updateSeedMenuSelection() {
    const total = PLANTABLE_CROP_IDS.length
    const windowStart = this.getSeedMenuWindowStart()

    const cropId = PLANTABLE_CROP_IDS[this.seedMenuIndex]
    const crop = GameData.crops.find((c) => c.id === cropId)
    this.seedMenuLabel.setText(`${crop?.name ?? cropId} (${this.seedMenuIndex + 1}/${total})`)

    this.seedMenuIcons.forEach((icon, slot) => {
      const cropIndex = windowStart + slot
      if (cropIndex >= total) {
        icon.setVisible(false)
        return
      }
      icon
        .setTexture(`crop_${PLANTABLE_CROP_IDS[cropIndex]}_ready`)
        .setDisplaySize(this.seedMenuIconSize, this.seedMenuIconSize)
        .setVisible(true)
      if (cropIndex === this.seedMenuIndex) this.seedMenuHighlight.setPosition(icon.x, icon.y)
    })

    this.seedMenuArrowLeft.setVisible(windowStart > 0)
    this.seedMenuArrowRight.setVisible(windowStart + SEED_MENU_VISIBLE_SLOTS < total)
  }

  /** Tạo sẵn 1 lần UI menu chọn hạt (ẩn ban đầu) — cố định theo camera (`setScrollFactor(0)`) ở giữa-dưới màn
   * hình, kiểu bảng tròn góc xanh ngọc + viền sáng giống ảnh tham khảo user gửi. Icon dùng thẳng texture
   * `crop_<id>_ready` đã preload sẵn từ Sprint 2, không cần vẽ/asset riêng cho menu. Chỉ tạo đúng
   * `SEED_MENU_VISIBLE_SLOTS` icon (không phải 1 icon/cây trong toàn bộ 19 cây) — texture của từng icon đổi
   * động theo cửa sổ đang trượt tới, xem `updateSeedMenuSelection()`. */
  private createSeedMenu() {
    const iconSize = this.seedMenuIconSize
    const gap = 8
    const paddingX = 16
    const paddingY = 10

    const totalIconsWidth = SEED_MENU_VISIBLE_SLOTS * iconSize + (SEED_MENU_VISIBLE_SLOTS - 1) * gap
    this.seedMenuPanelWidth = totalIconsWidth + paddingX * 2
    this.seedMenuPanelHeight = iconSize + paddingY * 2

    const panel = this.add.graphics()
    panel.fillStyle(0x123a3f, 0.88)
    panel.fillRoundedRect(
      -this.seedMenuPanelWidth / 2,
      -this.seedMenuPanelHeight / 2,
      this.seedMenuPanelWidth,
      this.seedMenuPanelHeight,
      14
    )
    panel.lineStyle(2, 0x9fe8d8, 0.9)
    panel.strokeRoundedRect(
      -this.seedMenuPanelWidth / 2,
      -this.seedMenuPanelHeight / 2,
      this.seedMenuPanelWidth,
      this.seedMenuPanelHeight,
      14
    )

    this.seedMenuLabel = this.add
      .text(0, -this.seedMenuPanelHeight / 2 - 12, '', {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5, 1)

    const startX = -totalIconsWidth / 2 + iconSize / 2
    this.seedMenuIcons = Array.from({ length: SEED_MENU_VISIBLE_SLOTS }, (_, slot) =>
      this.add
        .image(startX + slot * (iconSize + gap), 0, `crop_${PLANTABLE_CROP_IDS[0]}_ready`)
        .setDisplaySize(iconSize, iconSize)
    )

    this.seedMenuHighlight = this.add
      .rectangle(0, 0, iconSize + 6, iconSize + 6, 0xffd963, 0.3)
      .setStrokeStyle(2, 0xffd963)

    const arrowStyle = { fontSize: '18px', color: '#ffffff', fontFamily: 'monospace' }
    this.seedMenuArrowLeft = this.add
      .text(-this.seedMenuPanelWidth / 2 - 14, 0, '‹', arrowStyle)
      .setOrigin(0.5)
    this.seedMenuArrowRight = this.add
      .text(this.seedMenuPanelWidth / 2 + 14, 0, '›', arrowStyle)
      .setOrigin(0.5)

    this.seedMenuContainer = this.add
      .container(this.scale.width / 2, this.scale.height - 80, [
        panel,
        this.seedMenuHighlight,
        ...this.seedMenuIcons,
        this.seedMenuLabel,
        this.seedMenuArrowLeft,
        this.seedMenuArrowRight
      ])
      .setScrollFactor(0)
      .setDepth(SEED_MENU_DEPTH)
      .setVisible(false)
  }

  /** `pointer.x/y` (toạ độ canvas) có nằm trong vùng bảng chọn hạt hay không — dùng để nhận biết "click ra
   * ngoài" (đóng menu). So trực tiếp bằng toạ độ canvas vì bảng cố định theo camera (`setScrollFactor(0)`),
   * không cần quy đổi qua world như các chỗ click khác trong scene. */
  private isPointerInsideSeedMenu(pointer: Phaser.Input.Pointer): boolean {
    const halfWidth = this.seedMenuPanelWidth / 2
    const halfHeight = this.seedMenuPanelHeight / 2
    const cx = this.seedMenuContainer.x
    const cy = this.seedMenuContainer.y
    return (
      pointer.x >= cx - halfWidth &&
      pointer.x <= cx + halfWidth &&
      pointer.y >= cy - halfHeight &&
      pointer.y <= cy + halfHeight
    )
  }

  /** Gọi mỗi frame sau `farmManager.update()` — đồng bộ hình vẽ theo state thật: đổi texture đất khi cuốc,
   * tạo/đổi/xoá ảnh cây theo giai đoạn lớn hiện tại. So sánh texture key trước khi `setTexture()` để tránh
   * upload lại GPU texture mỗi frame khi không có gì đổi (90 ô, chạy mỗi frame, không nên làm dư việc). */
  private syncFarmVisuals() {
    for (const tile of this.farmManager.getTiles()) {
      const soilImage = this.soilImages.get(tile.id)
      if (soilImage) {
        const soilTexture =
          tile.state === 'empty' ? FARM_TILE_TEXTURES.untilled : FARM_TILE_TEXTURES.tilled
        if (soilImage.texture.key !== soilTexture) {
          soilImage.setTexture(soilTexture)
          // Đổi texture thì phải áp lại scale bù viền — setDisplaySize lúc đặt ban đầu chỉ tính cho texture
          // untilled ban đầu, không tự đổi theo khi cuốc.
          const scale = SOIL_TEXTURE_DISPLAY_SCALE[soilTexture] ?? 1
          soilImage.setDisplaySize(tile.width * scale, tile.height * scale)
        }
      }

      const stage = this.farmManager.getVisualStage(tile)
      const cropImage = this.cropImages.get(tile.id)
      if (stage && tile.cropId) {
        const textureKey = this.cropTextureKey(tile.cropId, stage)
        if (!cropImage) {
          this.cropImages.set(
            tile.id,
            this.add
              .image(tile.x, tile.y, textureKey)
              .setDisplaySize(tile.width * 0.85, tile.height * 0.85)
              .setDepth(CROP_DEPTH)
          )
        } else if (cropImage.texture.key !== textureKey) {
          cropImage.setTexture(textureKey)
        }
      } else if (cropImage) {
        cropImage.destroy()
        this.cropImages.delete(tile.id)
      }
    }
  }

  private cropTextureKey(cropId: string, stage: CropVisualStage): string {
    return `crop_${cropId}_${stage}`
  }

  /** Texture item icon (`<id>.png`, khác các stage hiển thị trên map) — dùng cho hiệu ứng bay lên khi thu
   * hoạch, xem `playHarvestFx()`. */
  private cropItemTextureKey(cropId: string): string {
    return `crop_${cropId}_item`
  }

  /** Đặt hàng rào gỗ bao quanh khu đất (4 trụ góc + 2 đoạn ngang trên/dưới + 2 đoạn dọc trái/phải), toạ độ tính
   * sẵn trong `data/fencePlacements.ts`. Depth theo `bottomY` (điểm thấp nhất của mảnh hàng rào) để Y-sort đúng
   * với player.y — đứng trên cạnh trên thì bị hàng rào che, đứng dưới cạnh dưới thì che hàng rào. Chỉ trang trí,
   * chưa có va chạm (collisionZones.ts đang do người chơi tự chỉnh tay qua EditorScene). */
  private placeFence() {
    for (const fence of FENCE_PLACEMENTS) {
      this.addGroundShadow(fence.x, fence.bottomY, fence.width * 0.85, fence.bottomY - 0.5)
      this.add
        .image(fence.x, fence.y, fence.texture)
        .setDisplaySize(fence.width, fence.height)
        .setDepth(fence.bottomY)
    }
  }

  /** Đặt nhà chính người chơi (hiện chỉ cấp 1) lên khoảnh cỏ trống cạnh cụm ô đất, toạ độ tính sẵn trong
   * `data/housePlacement.ts`. Depth theo `bottomY` (đáy nhà) để Y-sort đúng với player.y, giống cách làm với
   * hàng rào ở `placeFence()`. */
  private placeHouse() {
    const texture = HOUSE_LEVEL_TEXTURES[PLAYER_HOUSE.level]

    // Sau 2 lần thử hình khối riêng (bầu dục generic rồi silhouette thật của ảnh nhà) đều bị lỗi vị trí/tỉ lệ
    // khó kiểm soát (xem lịch sử ở progress.md), quay lại đúng công thức đã dùng cho hàng rào (`placeFence()`)
    // — vốn đã nhìn ổn, không ai phàn nàn: bóng bầu dục mờ viền, đặt sát đáy vật (không lệch/không cách khoảng
    // trống), chỉ đổi mỗi bề ngang cho phù hợp 1 khối to như nhà.
    this.addGroundShadow(
      PLAYER_HOUSE.x,
      PLAYER_HOUSE.bottomY,
      PLAYER_HOUSE.width * 0.95,
      PLAYER_HOUSE.bottomY - 0.5
    )

    this.add
      .image(PLAYER_HOUSE.x, PLAYER_HOUSE.y, texture)
      .setDisplaySize(PLAYER_HOUSE.width, PLAYER_HOUSE.height)
      .setDepth(PLAYER_HOUSE.bottomY)
  }

  /** Bóng đổ dùng chung cho mọi prop tĩnh đứng trên mặt đất (hàng rào, nhà...) — dùng lại `SHADOW_TEXTURE` của
   * player để đồng bộ 1 kiểu bóng cho cả map. Đặt ở đúng đáy prop (world y trùng `bottomY` của prop đó), depth
   * thấp hơn prop 1 chút (giống cách Player.ts đặt shadow thấp hơn player) để không lẫn thứ tự vẽ. */
  private addGroundShadow(x: number, y: number, width: number, depth: number) {
    const height = width * (20 / 48) // giữ đúng tỉ lệ khung hình gốc của SHADOW_TEXTURE (48x20)
    this.add
      .image(x, y, SHADOW_TEXTURE)
      .setDisplaySize(width, height)
      .setAlpha(0.85)
      .setDepth(depth)
  }

  /** Texture bóng đổ dùng chung (vẽ bằng code, không cần asset riêng) — ellipse mờ đặt dưới chân player
   * để tăng cảm giác "đứng trên mặt đất", phối hợp với Y-sort tạo hiệu ứng 2.5D.
   * Dùng gradient toả tròn (canvas 2D) thay vì ellipse tô đặc 1 màu — ellipse đặc viền cứng nhìn như dán đè lên
   * nền, gradient mờ dần ra mép trông tự nhiên hơn nhiều. Bật LINEAR filter riêng cho texture này vì game đang
   * bật `pixelArt: true` (mặc định NEAREST) — nếu không sẽ làm gradient bị răng cưa/vằn thay vì mờ mượt. */
  private createShadowTexture() {
    if (this.textures.exists(SHADOW_TEXTURE)) return
    const width = 48
    const height = 20
    const canvasTexture = this.textures.createCanvas(SHADOW_TEXTURE, width, height)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const cx = width / 2
    const cy = height / 2
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx)
    gradient.addColorStop(0, 'rgba(0,0,0,0.4)')
    gradient.addColorStop(0.6, 'rgba(0,0,0,0.22)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(cx, cy, cx, cy, 0, 0, Math.PI * 2)
    ctx.fill()
    canvasTexture.refresh()
    this.textures.get(SHADOW_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }

  /** Texture mũi tên báo khối tương tác được (vẽ bằng code, không cần asset riêng) — hình thoi/kim cương vàng
   * viền nâu đậm kiểu pixel-art, chóp nhọn hướng xuống để chỉ đúng khối bên dưới nó. Vẽ to hơn kích thước hiển
   * thị thật (`create()` sẽ không scale lại) rồi bật LINEAR filter — tương tự lý do ở `createShadowTexture()`. */
  private createInteractionPointerTexture() {
    if (this.textures.exists(INTERACTION_POINTER_TEXTURE)) return
    const width = 22
    const height = 26
    const canvasTexture = this.textures.createCanvas(INTERACTION_POINTER_TEXTURE, width, height)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const cx = width / 2

    // Kim cương: đỉnh trên phẳng-ish, chóp dưới nhọn hẳn xuống để rõ ràng đang "trỏ vào" khối bên dưới.
    ctx.beginPath()
    ctx.moveTo(cx, 2)
    ctx.lineTo(width - 2, 11)
    ctx.lineTo(cx, height - 2)
    ctx.lineTo(2, 11)
    ctx.closePath()
    ctx.fillStyle = '#FFD963' // đúng màu vàng đã dùng cho spinner loading (art-refs/theme.md)
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#7A4A1F'
    ctx.stroke()

    // Highlight nhỏ góc trên-trái cho có chiều sâu, đỡ phẳng.
    ctx.beginPath()
    ctx.moveTo(cx, 5)
    ctx.lineTo(cx - 6, 11)
    ctx.lineTo(cx, 9)
    ctx.closePath()
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fill()

    canvasTexture.refresh()
    this.textures.get(INTERACTION_POINTER_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }
}
