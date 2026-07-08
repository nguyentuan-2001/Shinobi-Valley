import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { FARM_COLLISION_ZONES } from '../data/collisionZones'
import { FARM_TILE_PLACEMENTS, type FarmTileType } from '../data/farmTiles'
import { FENCE_PLACEMENTS } from '../data/fencePlacements'
import { PLAYER_HOUSE, HOUSE_LEVEL_TEXTURES } from '../data/housePlacement'
import { WELL_PLACEMENT, WELL_AUTO_WATER_RADIUS } from '../data/wellPlacement'
import { FarmManager, type CropVisualStage, type FarmTileRuntime } from '../systems/FarmManager'
import { TimeManager } from '../systems/TimeManager'
import { inventoryManager } from '../systems/InventoryManager'
import { resolvePolygonCollision } from '../systems/CollisionUtils'
import { GameData } from '../data/DataLoader'
import { FARM_EXIT_ZONES } from '../data/mapTransitions'
import { checkExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
import {
  ROAST_CHICKEN_PLACEMENT,
  ROAST_CHICKEN_INTERACT_RADIUS
} from '../data/roastChickenPlacement'

/** Nền luôn ở dưới cùng, không tham gia Y-sort với player/prop khác (xem hàm depth ở Player.ts). */
const GROUND_DEPTH = -10000
/** Ô đất trồng cây nằm ngay trên nền nhưng luôn dưới player/shadow (player depth = y, luôn > 0 trong map này). */
const FARM_TILE_DEPTH = -1
/** Cây trồng vẽ ngay trên lớp đất — vẫn thấp hơn player (player depth = y luôn > 0), không cần Y-sort riêng
 * vì cây coi như nằm phẳng trên mặt đất giống ô đất, không có chiều cao để player đi "sau" nó. */
const CROP_DEPTH = FARM_TILE_DEPTH + 0.2
/** Thanh trạng thái (độ ẩm/sản lượng + đếm giờ chín) treo phía trên ô đất đang có cây lớn — nổi trên cây nhưng
 * vẫn thấp hơn player (player depth = y luôn > 0), giống cách `CROP_DEPTH` nổi trên `FARM_TILE_DEPTH`. */
const GROWTH_STATUS_DEPTH = CROP_DEPTH + 0.1
/** Độ ẩm 50-100% quy đổi thẳng sang tỉ lệ đầy của thanh (50%→nửa thanh, 100%→đầy) — không remap lại khoảng, để
 * người chơi học được "thanh không bao giờ về hẳn 0, tưới là đầy lại" đúng như cơ chế thật. */
const GROWTH_BAR_WIDTH_RATIO = 0.8
const GROWTH_BAR_HEIGHT = 4
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
/** Bảng túi đồ phải nổi trên cả menu hạt giống — 2 bảng không mở cùng lúc trong thực tế, nhưng để độc lập theo
 * depth cho chắc, không phụ thuộc thứ tự tạo. */
const INVENTORY_DEPTH = SEED_MENU_DEPTH + 1
/** Bảng Công Cụ Nông Trại (cuốc/tưới/gieo/hái tất cả) — cũng không mở cùng lúc với 2 bảng trên, độc lập depth
 * cho chắc giống cách làm với `INVENTORY_DEPTH`. */
const BULK_ACTIONS_DEPTH = INVENTORY_DEPTH + 1
/** Overlay đất ẩm vẽ ngay trên ảnh đất, dưới cây trồng — đất ẩm không được che mất cây phía trên nó. */
const MOISTURE_OVERLAY_DEPTH = FARM_TILE_DEPTH + 0.1
const MOISTURE_OVERLAY_TEXTURE = 'moisture_overlay'
const WATER_FX_TEXTURE = 'water_droplet_fx'
const WELL_TEXTURE = 'farm_well'
const ROAST_CHICKEN_TEXTURE = 'roast_chicken'
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

/** Toàn bộ 20 cây trong `crops.json` — chọn qua menu hạt giống (mở khi Enter lên ô đã cuốc). Chưa có
 * inventory/tiền/mở khoá theo level thật (đó là việc của Sprint 4) nên danh sách này coi như "có sẵn tất cả,
 * miễn phí" — kể cả cây Tier Cao Cấp/Hiếm đáng lẽ phải mở khoá theo `unlock_level` hoặc chỉ có qua drop
 * (`seed_cost: 0` trong data). Không lọc theo tier ở đây vì chưa có gì để lọc dựa vào (chưa có level người
 * chơi) — làm ngay bây giờ dễ tạo cảm giác sai "đã unlock" mà thực ra chỉ là chưa có cơ chế chặn.
 * `natures_essence` (Tinh Hoa Thiên Nhiên) trước đây cố tình loại khỏi danh sách vì tưởng chỉ craft-only —
 * user yêu cầu cho trồng được như thường, đã thêm vào `crops.json` (xem `docs/planning/progress.md`). Vẫn giữ
 * nguyên công thức craft (3 Nhân Sâm + 3 Sâm Đỏ + 5 Linh Khí, xem `docs/gameplay/crafting.md`) làm nguồn thay
 * thế — trồng trực tiếp chỉ là 1 cách khác để có, không thay thế cách craft cũ. */
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
  'ancient_seed',
  'natures_essence'
] as const
/** Menu hạt giống chỉ hiện 1 "cửa sổ" trượt gồm chừng này ô cùng lúc (không phải cả 19 icon nhồi 1 hàng) — số
 * lẻ để ô đang chọn luôn nằm giữa. Bề rộng bảng tính theo số này, không theo tổng số cây, nên thêm/bớt cây
 * trong `crops.json` sau này không làm bảng phình to thêm. */
const SEED_MENU_VISIBLE_SLOTS = 7
/** Lưới túi đồ cố định 6×5 = 30 ô — chưa cần giới hạn/mở rộng theo gameplay thật (mua túi lớn hơn...) vì Sprint
 * 4 chỉ cần "có chỗ chứa item thu hoạch, hiện đúng số lượng", chưa phải hệ thống quản lý túi đồ đầy đủ. */
const INVENTORY_GRID_COLUMNS = 6
const INVENTORY_GRID_ROWS = 5
const INVENTORY_SLOT_SIZE = 40
const INVENTORY_SLOT_GAP = 6

export class GameScene extends Phaser.Scene {
  private player!: Player
  /** Khoá input di chuyển/tấn công trong lúc fade chuyển màn (Sprint 5) — đúng pattern `seedMenuOpen` nhưng lý
   * do khoá khác nhau (đang fade thay vì đang mở menu). Bắt đầu `true` vì MỌI lần `create()` chạy đều fade-in
   * (kể cả lần đầu boot game, không riêng gì lúc quay lại từ Bãi Tập Luyện/Đồng Cỏ), xem `fadeInScene()`. */
  private isTransitioning = true
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
  /** Gà Quay ở nông trại — vật hồi phục toàn phần đứng cố định, ăn tại chỗ bằng Enter khi đứng gần (xem
   * `tryEatRoastChicken()`). Hết sau khi ăn, tự có lại vào sáng hôm sau (`dayStart`), giống nhịp giếng nước tự
   * tưới — user yêu cầu "lúc nào quay về cũng thấy được", nghĩa là 1 nguồn hồi phục tái tạo, không phải item
   * dùng 1 lần vĩnh viễn. */
  private roastChickenImage!: Phaser.GameObjects.Image
  private roastChickenAvailable = true
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
  /** Danh sách cây thật sự hiện trong menu — lọc lại theo loại ô mục tiêu mỗi lần mở (`openSeedMenu()`, xem
   * `getCompatibleCropIds()`): ô `water_pot` chỉ hiện cây `needs_water_tile` (Hoa Sen), ô đất thường chỉ hiện
   * cây không cần nước — tránh chọn được cây rồi bị `plant()` từ chối thầm lặng do sai loại ô. Mặc định bằng
   * `PLANTABLE_CROP_IDS` (đủ 20 cây) trước khi có tile mục tiêu nào. */
  private seedMenuCropIds: readonly string[] = PLANTABLE_CROP_IDS
  private seedMenuContainer!: Phaser.GameObjects.Container
  private seedMenuIcons: Phaser.GameObjects.Image[] = []
  private seedMenuHighlight!: Phaser.GameObjects.Rectangle
  private seedMenuLabel!: Phaser.GameObjects.Text
  /** Mũi tên báo còn hạt ở bên trái/phải "cửa sổ" đang hiện — ẩn khi đã ở đầu/cuối danh sách cây đang hiện. */
  private seedMenuArrowLeft!: Phaser.GameObjects.Text
  private seedMenuArrowRight!: Phaser.GameObjects.Text
  /** Kích thước icon cố định (px) — phải áp lại bằng `setDisplaySize()` mỗi lần `setTexture()` đổi icon sang
   * cây khác, vì các ảnh item icon (`crop_<id>_item`) có kích thước GỐC khác hẳn nhau giữa các cây (không đồng
   * bộ), đổi texture không tự giữ nguyên display size cũ — quên bước này khiến icon to nhỏ lộn xộn, có cây gần
   * như biến mất (bug thật đã gặp khi test menu với đủ 19 cây thay vì chỉ 3 cây cùng cỡ như trước). */
  private seedMenuIconSize = 32
  /** Kích thước bảng thật (tính động theo số hạt, xem `createSeedMenu()`) — cần lưu lại để so bằng con trỏ
   * chuột lúc click ra ngoài đóng menu, xem `isPointerInsideSeedMenu()`. */
  private seedMenuPanelWidth = 0
  private seedMenuPanelHeight = 0

  /** Túi đồ — dùng thẳng singleton `inventoryManager` (import ở đầu file, xem giải thích lý do trong
   * `InventoryManager.ts`), không tự giữ instance riêng. Mở/đóng bằng phím I, đứng yên player khi mở (giống
   * menu hạt giống). */
  private inventoryOpen = false
  private inventoryContainer!: Phaser.GameObjects.Container
  private inventoryPanelWidth = 0
  private inventoryPanelHeight = 0
  /** 1 icon + 1 text số lượng cho mỗi ô trong lưới cố định — cập nhật lại nội dung mỗi lần mở/thay đổi túi đồ,
   * không tạo/xoá object động (khác cách làm `cropImages` vì số ô ở đây CỐ ĐỊNH, không đổi theo dữ liệu). */
  private inventorySlotIcons: Phaser.GameObjects.Image[] = []
  private inventorySlotTexts: Phaser.GameObjects.Text[] = []

  /** Bảng Công Cụ Nông Trại (cuốc/tưới/gieo/hái tất cả ô trong 1 khoảng ID, để trống 1 hoặc cả 2 ô nhập =
   * không giới hạn phía đó) — mở/đóng bằng phím **F**, đứng yên player khi mở (giống 2 bảng trên). 2 ô nhập số
   * dùng DOM Element thật (`this.add.dom()`, xem `main.ts` — Phaser không có text input dựng bằng canvas) nên
   * KHÔNG nằm trong `Container` như phần còn lại của bảng (DOM Element không hỗ trợ làm con của Container) —
   * tự đồng bộ `setVisible()` riêng theo `bulkActionsOpen`, xem `createBulkActionsUI()`. */
  private bulkActionsOpen = false
  private bulkActionsContainer!: Phaser.GameObjects.Container
  private bulkActionsPanelWidth = 0
  private bulkActionsPanelHeight = 0
  private bulkFromInput!: Phaser.GameObjects.DOMElement
  private bulkToInput!: Phaser.GameObjects.DOMElement
  /** Text kết quả hiện sau khi bấm 1 trong 4 nút (VD: "Đã cuốc 5 ô") — phản hồi tức thời, không cần mở lại
   * bảng mới thấy. */
  private bulkStatusText!: Phaser.GameObjects.Text
  /** Label của riêng nút "Gieo Hạt Tất Cả" — cập nhật lại tên hạt đang chọn mỗi lần mở bảng (`openBulkActions()`),
   * giữ reference riêng vì đây là nút duy nhất có label đổi động (3 nút còn lại là text tĩnh). */
  private bulkActionButtonTexts: Phaser.GameObjects.Text[] = []
  /** Toạ độ/kích thước 4 nút trong bảng (tính 1 lần lúc tạo, xem `createBulkActionsUI()`) — dùng lại để tự
   * hit-test thủ công trong `handleBulkActionsClick()`, xem giải thích lý do không dùng `.setInteractive()`
   * trực tiếp trên nút tại chỗ khai báo layout này. */
  private bulkButtonLayout = { width: 0, height: 0, gap: 0, firstY: 0 }

  /** Overlay tô đất ẩm theo % moisture của từng ô đang có cây sống — key là `FarmTilePlacement.id`, giống cách
   * `cropImages` theo dõi ảnh cây (tạo khi bắt đầu có cây, xoá khi ô hết cây). */
  private readonly moistureOverlays = new Map<number, Phaser.GameObjects.Image>()

  /** Thanh trạng thái treo phía trên ô đang có cây LỚN (state `planted`, chưa chín) — thanh dưới thể hiện %
   * moisture (đúng "sản lượng giảm nếu không tưới" — sản lượng thu hoạch cuối cùng tỉ lệ thẳng với moisture
   * lúc hái, xem `FarmManager.harvest()`), chữ số phía trên đếm ngược thời gian tới lúc chín. Key là
   * `FarmTilePlacement.id`, cùng cách theo dõi với `cropImages`/`moistureOverlays`. */
  private readonly growthStatusUI = new Map<
    number,
    {
      barBg: Phaser.GameObjects.Rectangle
      barFill: Phaser.GameObjects.Rectangle
      timerText: Phaser.GameObjects.Text
    }
  >()

  constructor() {
    super({ key: 'GameScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    // `create()` chạy lại mỗi lần `scene.start('GameScene', ...)` được gọi (quay lại từ Bãi Tập Luyện/Đồng Cỏ)
    // trên CÙNG 1 instance scene — field initializer `= true` chỉ chạy đúng 1 lần lúc Phaser tạo instance ban
    // đầu, không tự reset lại mỗi lần `create()`. Phải gán tay ở đây để mỗi lần quay lại đều khoá input đúng
    // trong lúc fade-in, không "kế thừa" giá trị `false` còn sót từ lần trước.
    this.isTransitioning = true
    this.createShadowTexture()
    this.createInteractionPointerTexture()
    this.createMoistureOverlayTexture()
    this.createWaterDropletTexture()
    this.interactionPointer = this.add
      .image(0, 0, INTERACTION_POINTER_TEXTURE)
      .setDepth(INTERACTION_POINTER_DEPTH)
      .setVisible(false)
    this.createSeedMenu()
    this.createInventoryUI()

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
    // CHỈ tạo mới lần ĐẦU TIÊN — `create()` chạy lại mỗi lần quay về Farm từ Bãi Tập Luyện/Đồng Cỏ (Sprint 5,
    // trên CÙNG 1 instance scene, xem giải thích ở `isTransitioning`), tạo `FarmManager` mới mỗi lần sẽ xoá
    // sạch toàn bộ tiến độ ô đất (cuốc/trồng/độ ẩm) đang có — bug thật phát hiện khi làm tính năng Gà Quay (cần
    // đúng cơ chế "giữ trạng thái" này để biết gà đã ăn hay chưa). Visual (ảnh đất/cây) vẫn phải tạo lại mỗi lần
    // vì Phaser tự huỷ toàn bộ GameObject của scene cũ khi `scene.start()` — chỉ riêng STATE thuần (không phải
    // GameObject) mới cần giữ nguyên qua field của chính scene này.
    this.placeFarmTiles()
    if (!this.farmManager) this.farmManager = new FarmManager(FARM_TILE_PLACEMENTS)
    this.createBulkActionsUI()
    this.placeFence()
    this.placeHouse()
    this.createWellTexture()
    this.placeWell()
    this.placeRoastChicken()
    // Cổng dịch chuyển sang Bãi Tập Luyện/Đồng Cỏ (Sprint 5) — vẽ cổng cho MỌI Exit Zone của Farm tự động,
    // không hardcode riêng từng cổng (thêm map chiến đấu mới sau này chỉ cần thêm 1 phần tử vào
    // `FARM_EXIT_ZONES`, cổng tự hiện ra không cần sửa `GameScene`).
    for (const zone of FARM_EXIT_ZONES) placePortalAtZone(this, zone)

    // Sprint 3 — đồng hồ trong game (tách biệt hoàn toàn với giờ THỰC dùng để lớn cây ở FarmManager, xem
    // comment trong TimeManager.ts). CHỈ tạo mới lần đầu — cùng lý do với `farmManager` ở trên, tạo lại mỗi lần
    // quay về Farm sẽ làm đồng hồ nhảy về 06:00 Ngày 1, mất hết thời gian đã trôi qua. Đăng ký listener
    // `dayStart` cũng phải theo cùng điều kiện — nếu không sẽ cộng dồn thêm 1 listener MỚI mỗi lần quay về,
    // khiến giếng tưới N lần lặp lại vào những sáng sau (N = số lần đã quay về Farm).
    const isFirstTimeSetup = !this.timeManager
    if (isFirstTimeSetup) this.timeManager = new TimeManager()
    // Overlay tối phủ theo camera (scrollFactor 0), không phải world object — GameObject nên vẫn phải tạo lại
    // mỗi lần dù timeManager giữ nguyên, khác nhau ở chỗ CHỈ instance TimeManager mới cần giữ.
    this.nightOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x0a1a3f)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(INTERACTION_POINTER_DEPTH - 1)
      .setAlpha(this.timeManager.getNightOverlayAlpha())

    // Giếng nước tự động tưới ô gần nó mỗi sáng — "mỗi sáng" ăn theo `dayStart` (mốc đêm->ngày thật, ~6h, xem
    // `TimeManager.computeIsNight()`), không phải `dayChange` (mốc nửa đêm 0h) vì "sáng" theo nghĩa thường
    // (bình minh) khớp `dayStart` hơn hẳn.
    if (isFirstTimeSetup) this.timeManager.on('dayStart', () => this.autoWaterNearWell())

    // Toạ độ spawn mặc định (890,430) khi vào Farm lần đầu (boot game) — `data.spawnX/spawnY` chỉ có giá trị
    // khi quay lại từ Bãi Tập Luyện/Đồng Cỏ qua Exit Zone (xem `data/mapTransitions.ts`).
    this.player = new Player(this, data?.spawnX ?? 890, data?.spawnY ?? 430, 'women')

    this.cameras.main.setBounds(0, 0, background.displayWidth, background.displayHeight)
    this.cameras.main.startFollow(this.player, true)

    // selectSeed()/updateTimeHud() ghi vào registry TRƯỚC khi launch UIScene — để UIScene.create() đọc registry
    // lần đầu đã có sẵn giá trị đúng, không cần chờ event 'changedata' bắn ra mới hiện chữ.
    this.selectSeed(this.selectedCropId)
    this.updateTimeHud()
    syncCombatHudToRegistry(this)
    this.scene.launch('UIScene')

    fadeInScene(this, () => {
      this.isTransitioning = false
    })

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

    // Esc: đóng menu hạt giống/túi đồ/bảng công cụ nông trại mà không làm gì khác — không có lối thoát nào khác
    // một khi đã mở.
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      if (event.repeat) return
      if (this.seedMenuOpen) {
        event.preventDefault()
        this.closeSeedMenu()
      } else if (this.inventoryOpen) {
        event.preventDefault()
        this.closeInventory()
      } else if (this.bulkActionsOpen) {
        event.preventDefault()
        this.closeBulkActions()
      }
    })

    // I: mở/đóng túi đồ (Sprint 4) — không mở được khi menu hạt giống/bảng công cụ đang mở, tránh nhiều bảng
    // cùng hiện chồng lên nhau (đều giữa màn hình, sẽ đè nhau nhìn rối).
    this.input.keyboard!.on('keydown-I', (event: KeyboardEvent) => {
      if (event.repeat || this.seedMenuOpen || this.bulkActionsOpen) return
      event.preventDefault()
      if (this.inventoryOpen) this.closeInventory()
      else this.openInventory()
    })

    // F: mở/đóng bảng Công Cụ Nông Trại (cuốc/tưới/gieo/hái tất cả) — cùng quy tắc loại trừ với I ở trên.
    this.input.keyboard!.on('keydown-F', (event: KeyboardEvent) => {
      if (event.repeat || this.seedMenuOpen || this.inventoryOpen) return
      event.preventDefault()
      if (this.bulkActionsOpen) this.closeBulkActions()
      else this.openBulkActions()
    })

    // Click ra ngoài bảng khi menu hạt giống/túi đồ đang mở = đóng bảng đó; bảng Công Cụ Nông Trại thì click
    // BÊN TRONG = bấm đúng 1 trong 4 nút (tự hit-test thủ công, xem `handleBulkActionsClick()` + giải thích lý
    // do không dùng `.setInteractive()` trực tiếp), click ra ngoài = đóng, cùng hành vi Esc. `pointer.x/y` là
    // toạ độ canvas, so trực tiếp được với vị trí container vì cả 3 bảng đều `setScrollFactor(0)` (cố định
    // theo camera, không lệch theo world scroll).
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.seedMenuOpen && !this.isPointerInsideSeedMenu(pointer)) {
        this.closeSeedMenu()
      } else if (this.inventoryOpen && !this.isPointerInsideInventory(pointer)) {
        this.closeInventory()
      } else if (this.bulkActionsOpen) {
        if (this.isPointerInsideBulkActions(pointer)) this.handleBulkActionsClick(pointer)
        else this.closeBulkActions()
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
    // Đứng yên hoàn toàn khi menu hạt giống/túi đồ/bảng công cụ nông trại đang mở (giống game farming tham
    // khảo) — không gọi player.update() nên cursors ←/→ (đang dùng để điều hướng menu) không vô tình làm player
    // di chuyển theo. `isTransitioning` (Sprint 5, đang fade-in/out chuyển màn) khoá tương tự — đúng
    // `docs/gameplay/mechanics.md` mục "Hệ thống Chuyển Màn": khoá input di chuyển/tấn công trong lúc fade.
    if (
      !this.seedMenuOpen &&
      !this.inventoryOpen &&
      !this.bulkActionsOpen &&
      !this.isTransitioning
    ) {
      this.player.update()
      this.checkPolygonCollisions(delta)

      const exit = checkExitZones(this.player.x, this.player.y, FARM_EXIT_ZONES)
      if (exit) {
        this.isTransitioning = true
        fadeOutToScene(this, exit.targetScene, exit.entryPoint)
      }
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
   * 12 ô chậu nước) — toạ độ tính sẵn trong `data/farmTiles.ts`. Cả `untilled` VÀ `water_pot` đều giữ reference
   * vào `soilImages` (theo `id`) — `untilled` để `syncFarmVisuals()` đổi texture khi cuốc đất, `water_pot` chỉ
   * để ẩn/hiện theo có cây hay không (chậu nước không đổi texture qua các state, xem `syncFarmVisuals()`). */
  private placeFarmTiles() {
    for (const tile of FARM_TILE_PLACEMENTS) {
      const textureKey = FARM_TILE_TEXTURES[tile.type]
      const scale = SOIL_TEXTURE_DISPLAY_SCALE[textureKey] ?? 1
      const image = this.add
        .image(tile.x, tile.y, textureKey)
        .setDisplaySize(tile.width * scale, tile.height * scale)
        .setDepth(FARM_TILE_DEPTH)
      if (tile.type === 'untilled' || tile.type === 'water_pot') this.soilImages.set(tile.id, image)
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

    if (
      this.roastChickenAvailable &&
      Phaser.Math.Distance.Between(
        feetX,
        feetY,
        ROAST_CHICKEN_PLACEMENT.x,
        ROAST_CHICKEN_PLACEMENT.bottomY
      ) < ROAST_CHICKEN_INTERACT_RADIUS
    ) {
      return {
        x: ROAST_CHICKEN_PLACEMENT.x,
        y: ROAST_CHICKEN_PLACEMENT.y - ROAST_CHICKEN_PLACEMENT.height / 2
      }
    }

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

  /** Enter bấm khi menu đang mở = xác nhận hạt đang chọn rồi trồng. Enter bấm khi KHÔNG có menu = ưu tiên ăn Gà
   * Quay nếu đang đứng đủ gần và còn (xem `tryEatRoastChicken()`), nếu không mới tìm ô đất GẦN NHẤT trong bán
   * kính `FARM_TILE_INTERACT_RADIUS` (cùng điểm chân player dùng cho va chạm polygon: `body.center.x`,
   * `body.bottom` — và cùng bán kính dùng cho con trỏ báo, nên "thấy trỏ" luôn đi kèm "bấm được") rồi cuốc đất
   * (`empty`), mở menu chọn hạt (`tilled`), tưới nước (`planted`, chưa chín), thu hoạch (`ready`), hoặc dọn cây
   * héo (`withered`) — không làm gì nếu không có ô nào đủ gần. */
  private interactWithFarmTile() {
    if (this.seedMenuOpen) {
      this.confirmSeedMenu()
      return
    }

    if (this.tryEatRoastChicken()) return

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
    } else if (tile.state === 'planted') {
      if (this.farmManager.water(tile)) this.playWaterFx(tile.x, tile.y)
    } else if (tile.state === 'ready') {
      const result = this.farmManager.harvest(tile, this.timeManager.getHour())
      if (result) {
        inventoryManager.addItem(result.cropId, result.quantity)
        this.playHarvestFx(result.cropId, result.quantity, tile.x, tile.y)
        this.refreshInventoryUI()
      }
    } else if (tile.state === 'withered') {
      this.farmManager.clearWithered(tile)
    }
  }

  /** Hiệu ứng thu hoạch: icon vật phẩm (item icon, khác sprite `harvest` còn trên đất) hiện tại đúng vị trí ô
   * vừa hái, bay lên 1 đoạn ngắn rồi mờ dần và biến mất, kèm chữ `+N` báo số lượng vừa cộng vào túi đồ. */
  private playHarvestFx(cropId: string, quantity: number, x: number, y: number) {
    const icon = this.add
      .image(x, y, this.cropItemTextureKey(cropId))
      .setDisplaySize(24, 24)
      .setDepth(HARVEST_FX_DEPTH)
    const label = this.add
      .text(x + 14, y - 6, `+${quantity}`, {
        fontSize: '13px',
        color: '#ffe9a8',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      .setOrigin(0, 0.5)
      .setDepth(HARVEST_FX_DEPTH)
    this.tweens.add({
      targets: [icon, label],
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        icon.destroy()
        label.destroy()
      }
    })
  }

  /** Hiệu ứng tưới nước: vài giọt nước nhỏ rơi xuống rồi biến mất tại đúng vị trí ô — chỉ là phản hồi hình ảnh
   * tức thời (chưa có icon Bình tưới/animation thật, dùng texture vẽ bằng code tạm — xem
   * `createWaterDropletTexture()`), thay bằng asset thật khi có theo `art-refs/ui/ui.md`. */
  private playWaterFx(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const offsetX = (i - 1) * 10
      const droplet = this.add
        .image(x + offsetX, y - 20, WATER_FX_TEXTURE)
        .setDisplaySize(8, 10)
        .setDepth(HARVEST_FX_DEPTH)
      this.tweens.add({
        targets: droplet,
        y: y + 4,
        alpha: 0,
        duration: 420,
        delay: i * 60,
        ease: 'Cubic.easeIn',
        onComplete: () => droplet.destroy()
      })
    }
  }

  /** Mở menu chọn hạt giống lên 1 ô đã cuốc — nhớ lại ô mục tiêu (`seedMenuTargetTileId`) để `confirmSeedMenu()`
   * biết trồng vào đâu, khởi điểm menu ở đúng hạt đang chọn gần nhất (`selectedCropId`) cho liền mạch, và đứng
   * yên player (huỷ vận tốc hiện có — nếu đang đi mà mở menu, không huỷ thì player trôi tiếp theo quán tính cũ
   * dù `update()` đã ngừng gọi `player.update()`). */
  private openSeedMenu(tile: FarmTileRuntime) {
    this.seedMenuOpen = true
    this.seedMenuTargetTileId = tile.id
    this.seedMenuCropIds = this.getCompatibleCropIds(tile.tileType)
    const startIndex = this.seedMenuCropIds.indexOf(this.selectedCropId)
    this.seedMenuIndex = startIndex >= 0 ? startIndex : 0
    this.updateSeedMenuSelection()
    this.seedMenuContainer.setVisible(true)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  /** Lọc `PLANTABLE_CROP_IDS` theo đúng loại ô — khớp check `crop.needs_water_tile !== (tile.tileType ===
   * 'water_pot')` mà `FarmManager.plant()` dùng để từ chối, nhưng lọc TRƯỚC khi hiện ra menu để người chơi
   * không bao giờ chọn được combo chắc chắn thất bại (Hoa Sen chỉ hiện ở ô `water_pot`, mọi cây khác chỉ hiện
   * ở ô đất thường). */
  private getCompatibleCropIds(tileType: FarmTileType): readonly string[] {
    const isWaterTile = tileType === 'water_pot'
    return PLANTABLE_CROP_IDS.filter((id) => {
      const crop = GameData.crops.find((c) => c.id === id)
      return crop !== undefined && crop.needs_water_tile === isWaterTile
    })
  }

  private closeSeedMenu() {
    this.seedMenuOpen = false
    this.seedMenuTargetTileId = null
    this.seedMenuContainer.setVisible(false)
  }

  private moveSeedMenuSelection(direction: -1 | 1) {
    const count = this.seedMenuCropIds.length
    this.seedMenuIndex = (this.seedMenuIndex + direction + count) % count
    this.updateSeedMenuSelection()
  }

  /** Trồng đúng hạt đang được chọn (viền vàng) trong menu vào ô mục tiêu đã nhớ lúc mở menu, rồi đóng menu.
   * Cũng đồng bộ `selectedCropId`/HUD luôn — lần sau mở menu sẽ khởi điểm ở đúng hạt vừa trồng. */
  private confirmSeedMenu() {
    const cropId = this.seedMenuCropIds[this.seedMenuIndex]
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
    const total = this.seedMenuCropIds.length
    if (total <= SEED_MENU_VISIBLE_SLOTS) return 0
    const centered = this.seedMenuIndex - Math.floor(SEED_MENU_VISIBLE_SLOTS / 2)
    return Phaser.Math.Clamp(centered, 0, total - SEED_MENU_VISIBLE_SLOTS)
  }

  /** Cập nhật tên hạt + số thứ tự + đổi texture từng icon trong "cửa sổ" đang hiện + vị trí viền vàng highlight
   * theo `seedMenuIndex` hiện tại — gọi khi mở menu hoặc đổi lựa chọn bằng ←/→. Phải đổi texture icon mỗi lần
   * (không chỉ di chuyển highlight như bản 3-cây cũ) vì danh sách cây (tối đa 20, có thể ít hơn nếu đang lọc
   * theo loại ô — xem `seedMenuCropIds`) thường dài hơn số ô hiện cùng lúc (`SEED_MENU_VISIBLE_SLOTS`), icon
   * phải "trượt" theo cửa sổ thay vì đứng yên 1 chỗ. */
  private updateSeedMenuSelection() {
    const total = this.seedMenuCropIds.length
    const windowStart = this.getSeedMenuWindowStart()

    const cropId = this.seedMenuCropIds[this.seedMenuIndex]
    const crop = GameData.crops.find((c) => c.id === cropId)
    this.seedMenuLabel.setText(`${crop?.name ?? cropId} (${this.seedMenuIndex + 1}/${total})`)

    this.seedMenuIcons.forEach((icon, slot) => {
      const cropIndex = windowStart + slot
      if (cropIndex >= total) {
        icon.setVisible(false)
        return
      }
      icon
        .setTexture(this.cropItemTextureKey(this.seedMenuCropIds[cropIndex]))
        .setDisplaySize(this.seedMenuIconSize, this.seedMenuIconSize)
        .setVisible(true)
      if (cropIndex === this.seedMenuIndex) this.seedMenuHighlight.setPosition(icon.x, icon.y)
    })

    this.seedMenuArrowLeft.setVisible(windowStart > 0)
    this.seedMenuArrowRight.setVisible(windowStart + SEED_MENU_VISIBLE_SLOTS < total)
  }

  /** Tạo sẵn 1 lần UI menu chọn hạt (ẩn ban đầu) — cố định theo camera (`setScrollFactor(0)`) ở giữa-dưới màn
   * hình, kiểu bảng tròn góc xanh ngọc + viền sáng giống ảnh tham khảo user gửi. Icon dùng thẳng texture item
   * icon (`crop_<id>_item`) đã preload sẵn, không cần vẽ/asset riêng cho menu. Chỉ tạo đúng
   * `SEED_MENU_VISIBLE_SLOTS` icon (không phải 1 icon/cây trong toàn bộ danh sách) — texture của từng icon đổi
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
        .image(startX + slot * (iconSize + gap), 0, this.cropItemTextureKey(PLANTABLE_CROP_IDS[0]))
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
        // Chậu nước (`water_pot`) luôn giữ đúng 1 texture nước cố định — không có nấc "cuốc" nên không cần
        // đổi qua texture tilled/untilled như ô đất thường (đổi nhầm sẽ ra đất nâu giữa ao, sai hẳn).
        if (tile.tileType !== 'water_pot') {
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
        // Ẩn hẳn ảnh đất/nước khi ô đang có cây (planted/ready/withered) — mọi sprite cây (seed/sprout/growing/
        // harvest) đã tự vẽ sẵn 1 mô đất (hoặc mặt nước, với Hoa Sen) nhỏ ở đáy riêng (đúng "Quy tắc bám đất"
        // trong `art-refs/items/crops.md`), hiện thêm ảnh đất/nước full-size bên dưới nữa sẽ đè/xung đột hình.
        soilImage.setVisible(tile.cropId === null)
      }

      const stage = this.farmManager.getVisualStage(tile)
      const cropImage = this.cropImages.get(tile.id)
      if (stage && tile.cropId) {
        const textureKey = this.cropTextureKey(tile.cropId, stage)
        let image = cropImage
        if (!image) {
          image = this.add
            .image(tile.x, tile.y, textureKey)
            .setDisplaySize(tile.width * 0.85, tile.height * 0.85)
            .setDepth(CROP_DEPTH)
          this.cropImages.set(tile.id, image)
        } else if (image.texture.key !== textureKey) {
          image.setTexture(textureKey)
        }
        // Cây héo (`withered`) dùng lại đúng sprite `growing` (chưa có sprite héo riêng cho 20 cây, xem
        // `FarmManager.getVisualStage()`) nhưng tint xám để phân biệt rõ với cây đang lớn thật — bấm Enter dọn
        // về màu thường (`clearWithered()`), xem `interactWithFarmTile()`.
        const tint = tile.state === 'withered' ? 0x9a9a9a : 0xffffff
        if (image.tintTopLeft !== tint) image.setTint(tint)
      } else if (cropImage) {
        cropImage.destroy()
        this.cropImages.delete(tile.id)
      }

      // Overlay đất ẩm — chỉ hiện khi ô đang có cây sống (`getMoisture()` trả về số, null nếu không có gì để
      // tính). Alpha tỉ lệ thẳng với % moisture trong khoảng 50-100 (50% = trong suốt hẳn/không thấy gì khác
      // đất thường, 100% = tô rõ nhất) — chưa có ảnh overlay thật (`art-refs/ui/ui.md` chưa có prompt riêng
      // cho cái này), dùng texture vẽ bằng code tạm, xem `createMoistureOverlayTexture()`.
      const moisture = this.farmManager.getMoisture(tile)
      const moistureOverlay = this.moistureOverlays.get(tile.id)
      if (moisture !== null) {
        const alpha = ((moisture - 50) / 50) * 0.45
        if (!moistureOverlay) {
          this.moistureOverlays.set(
            tile.id,
            this.add
              .image(tile.x, tile.y, MOISTURE_OVERLAY_TEXTURE)
              .setDisplaySize(tile.width, tile.height)
              .setDepth(MOISTURE_OVERLAY_DEPTH)
              .setAlpha(alpha)
          )
        } else {
          moistureOverlay.setAlpha(alpha)
        }
      } else if (moistureOverlay) {
        moistureOverlay.destroy()
        this.moistureOverlays.delete(tile.id)
      }

      this.syncGrowthStatusUI(tile, moisture)
    }
  }

  /** Thanh trạng thái treo phía trên ô — chỉ hiện khi cây đang lớn (`planted`, chưa `ready`), ẩn ở mọi state
   * khác (đã hái/chưa trồng/đã chín — chín rồi thì không còn gì để đếm ngược hay giữ ẩm nữa). Tạo 1 lần rồi tái
   * dùng (giống `moistureOverlays`), chỉ cập nhật width/màu/text mỗi frame. */
  private syncGrowthStatusUI(tile: FarmTileRuntime, moisture: number | null) {
    const existing = this.growthStatusUI.get(tile.id)
    const isGrowing = tile.state === 'planted' && tile.cropId !== null && tile.plantedAt !== null

    if (!isGrowing) {
      if (existing) {
        existing.barBg.destroy()
        existing.barFill.destroy()
        existing.timerText.destroy()
        this.growthStatusUI.delete(tile.id)
      }
      return
    }

    const barWidth = tile.width * GROWTH_BAR_WIDTH_RATIO
    const barY = tile.y - tile.height / 2 - 9
    const textY = barY - 8
    const ui =
      existing ??
      (() => {
        const created = {
          barBg: this.add
            .rectangle(tile.x, barY, barWidth, GROWTH_BAR_HEIGHT, 0x1a1a1a, 0.6)
            .setDepth(GROWTH_STATUS_DEPTH),
          barFill: this.add
            .rectangle(tile.x - barWidth / 2, barY, barWidth, GROWTH_BAR_HEIGHT, 0x6bcf6b, 0.95)
            .setOrigin(0, 0.5)
            .setDepth(GROWTH_STATUS_DEPTH + 0.01),
          timerText: this.add
            .text(tile.x, textY, '', {
              fontSize: '9px',
              color: '#ffe9a8',
              fontFamily: 'monospace'
            })
            .setOrigin(0.5)
            .setDepth(GROWTH_STATUS_DEPTH)
        }
        this.growthStatusUI.set(tile.id, created)
        return created
      })()

    // Thanh dưới = % moisture hiện tại (50-100 quy thẳng sang 0.5-1.0 tỉ lệ đầy) — đúng "sản lượng giảm nếu
    // không tưới" người dùng yêu cầu, vì sản lượng cuối cùng khi hái tỉ lệ thẳng với đúng số này.
    const fraction = Phaser.Math.Clamp((moisture ?? 100) / 100, 0, 1)
    ui.barFill.width = barWidth * fraction
    ui.barFill.setFillStyle(this.growthBarColor(fraction))

    // Chữ trên = thời gian thực còn lại tới khi chín, tính từ `plantedAt` + `cycleHours` (đúng chu kỳ hiện tại
    // — lần trồng đầu dùng `growth_hours`, hái lại dùng `regrow_hours`, xem `FarmManager`).
    const remainingMs = Math.max(0, tile.plantedAt! + tile.cycleHours * 3_600_000 - Date.now())
    ui.timerText.setText(this.formatRemainingTime(remainingMs))
  }

  /** Nội suy màu thanh moisture — đỏ-cam ở sàn 50% (fraction 0.5), xanh lá ở đầy 100% (fraction 1.0). Chỉ nội
   * suy trong nửa trên [0.5, 1] vì moisture không bao giờ xuống dưới 50%, nội suy cả khoảng [0,1] sẽ khiến màu
   * không bao giờ chạm 2 đầu thật của thang màu. */
  private growthBarColor(fraction: number): number {
    const t = Phaser.Math.Clamp((fraction - 0.5) / 0.5, 0, 1)
    const dry = { r: 0xd9, g: 0x53, b: 0x4f }
    const wet = { r: 0x6b, g: 0xcf, b: 0x6b }
    const r = Math.round(dry.r + (wet.r - dry.r) * t)
    const g = Math.round(dry.g + (wet.g - dry.g) * t)
    const b = Math.round(dry.b + (wet.b - dry.b) * t)
    return (r << 16) | (g << 8) | b
  }

  /** Định dạng thời gian còn lại gọn — giờ+phút khi còn ≥1h (cây chín tính bằng giờ nên đây là trường hợp phổ
   * biến nhất), phút+giây khi dưới 1h, chỉ giây khi dưới 1 phút. */
  private formatRemainingTime(ms: number): string {
    const totalSeconds = Math.ceil(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) return `${hours}h${minutes}m`
    if (minutes > 0) return `${minutes}m${seconds}s`
    return `${seconds}s`
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

  /** Đặt giếng nước lên khoảnh cỏ mở sát cụm ô đất dưới, toạ độ tính sẵn trong `data/wellPlacement.ts` — công
   * trình thuần tự động (không có tương tác Enter thủ công, xem `autoWaterNearWell()`), khác nhà/hàng rào chỉ
   * mang tính trang trí + Y-sort. */
  private placeWell() {
    this.addGroundShadow(
      WELL_PLACEMENT.x,
      WELL_PLACEMENT.bottomY,
      WELL_PLACEMENT.width * 0.9,
      WELL_PLACEMENT.bottomY - 0.5
    )
    this.add
      .image(WELL_PLACEMENT.x, WELL_PLACEMENT.y, WELL_TEXTURE)
      .setDisplaySize(WELL_PLACEMENT.width, WELL_PLACEMENT.height)
      .setDepth(WELL_PLACEMENT.bottomY)
  }

  /** Gọi mỗi khi `TimeManager` báo sang buổi sáng (`dayStart`) — tưới về 100% mọi ô đang có cây (`planted`)
   * nằm trong `WELL_AUTO_WATER_RADIUS` tính từ tâm giếng, đúng hiệu ứng "Tự động tưới 3×3 ô xung quanh mỗi
   * sáng" trong `docs/gameplay/farming.md`. Dùng lại đúng `FarmManager.water()` (chỉ có tác dụng lên ô
   * `planted`, tự bỏ qua ô trống/đã chín) nên không cần tự kiểm tra state ở đây — phát `playWaterFx()` cho
   * từng ô thực sự được tưới để người chơi thấy rõ giếng vừa hoạt động. */
  private autoWaterNearWell() {
    for (const tile of this.farmManager.getTiles()) {
      const distance = Math.hypot(tile.x - WELL_PLACEMENT.x, tile.y - WELL_PLACEMENT.y)
      if (distance > WELL_AUTO_WATER_RADIUS) continue
      if (this.farmManager.water(tile)) this.playWaterFx(tile.x, tile.y)
    }
  }

  /** Gà Quay — đặt cố định 1 chỗ trên nông trại, ăn tại chỗ bằng Enter khi đứng gần (xem `tryEatRoastChicken()`
   * ở `interactWithFarmTile()`). User yêu cầu rõ: "lúc nào quay về cũng thấy được" nghĩa là chỉ cần RA MAP
   * KHÁC rồi VÀO LẠI Farm là gà có ngay, KHÔNG phải chờ qua ngày hôm sau — khác hẳn `farmManager`/`timeManager`
   * phía trên (những cái đó CỐ Ý giữ nguyên qua các lần `create()` lại). Ở đây ngược lại: `create()` chạy lại
   * (dù lần đầu boot game hay quay về từ Bãi Tập Luyện/Đồng Cỏ) đều RESET thẳng về available — không đọc giá
   * trị cũ như 2 cái kia. */
  private placeRoastChicken() {
    this.roastChickenAvailable = true
    this.createRoastChickenTexture()
    this.addGroundShadow(
      ROAST_CHICKEN_PLACEMENT.x,
      ROAST_CHICKEN_PLACEMENT.bottomY,
      ROAST_CHICKEN_PLACEMENT.width * 0.9,
      ROAST_CHICKEN_PLACEMENT.bottomY - 0.5
    )
    this.roastChickenImage = this.add
      .image(ROAST_CHICKEN_PLACEMENT.x, ROAST_CHICKEN_PLACEMENT.y, ROAST_CHICKEN_TEXTURE)
      .setDisplaySize(ROAST_CHICKEN_PLACEMENT.width, ROAST_CHICKEN_PLACEMENT.height)
      .setDepth(ROAST_CHICKEN_PLACEMENT.bottomY)
      .setVisible(true)
  }

  /** User yêu cầu: ăn hồi đầy HP/MP, mất sau khi ăn, có lại ngay khi rời map rồi quay lại (xem
   * `placeRoastChicken()`). Trả về `true` nếu vừa ăn được (để `interactWithFarmTile()` biết mà return sớm,
   * không rơi tiếp xuống nhánh xử lý ô đất). */
  private tryEatRoastChicken(): boolean {
    if (!this.roastChickenAvailable) return false
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const distance = Phaser.Math.Distance.Between(
      body.center.x,
      body.bottom,
      ROAST_CHICKEN_PLACEMENT.x,
      ROAST_CHICKEN_PLACEMENT.bottomY
    )
    if (distance > ROAST_CHICKEN_INTERACT_RADIUS) return false

    combatManager.fullRestore()
    this.roastChickenAvailable = false
    this.roastChickenImage.setVisible(false)
    return true
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

  /** Overlay đất ẩm tạm (vẽ bằng code, không cần asset riêng — xem `syncFarmVisuals()`) — 1 ô vuông xanh-nâu
   * đậm mờ dần ra viền, tô lên trên ô đất để gợi cảm giác "đất ướt" khi alpha cao. Thay bằng ảnh thật (đổi
   * màu/độ bóng theo % moisture, đúng yêu cầu asset ở `dev-schedule.md` Sprint 4) khi có prompt/asset riêng. */
  private createMoistureOverlayTexture() {
    if (this.textures.exists(MOISTURE_OVERLAY_TEXTURE)) return
    const size = 32
    const canvasTexture = this.textures.createCanvas(MOISTURE_OVERLAY_TEXTURE, size, size)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const c = size / 2
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
    gradient.addColorStop(0, 'rgba(45,60,90,0.9)')
    gradient.addColorStop(0.7, 'rgba(45,60,90,0.6)')
    gradient.addColorStop(1, 'rgba(45,60,90,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    canvasTexture.refresh()
    this.textures.get(MOISTURE_OVERLAY_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }

  /** Giọt nước tạm (vẽ bằng code, không cần asset riêng — xem `playWaterFx()`) — hình giọt nước xanh nhạt đơn
   * giản. Thay bằng icon Bình tưới/hiệu ứng thật khi có, xem `art-refs/ui/ui.md`. */
  private createWaterDropletTexture() {
    if (this.textures.exists(WATER_FX_TEXTURE)) return
    const width = 8
    const height = 10
    const canvasTexture = this.textures.createCanvas(WATER_FX_TEXTURE, width, height)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.quadraticCurveTo(width, height * 0.65, width / 2, height)
    ctx.quadraticCurveTo(0, height * 0.65, width / 2, 0)
    ctx.closePath()
    ctx.fillStyle = '#6EC5FF' // River Light, art-refs/theme.md
    ctx.fill()
    canvasTexture.refresh()
    this.textures.get(WATER_FX_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }

  /** Giếng nước tạm (vẽ bằng code, không cần asset riêng) — vòng đá xám tròn + mặt nước xanh bên trong, mái gỗ
   * nhỏ phía trên. Thay bằng sprite thật khi có, xem `art-refs/world/buildings.md` mục "Hồ Chứa Nước / Giếng
   * Làng" (đã có prompt sẵn, chưa gen ảnh). */

  private createWellTexture() {
    if (this.textures.exists(WELL_TEXTURE)) return
    const size = 40
    const canvasTexture = this.textures.createCanvas(WELL_TEXTURE, size, size)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const cx = size / 2
    const cy = size / 2 + 4

    // Vòng đá xám bao ngoài.
    ctx.beginPath()
    ctx.arc(cx, cy, 15, 0, Math.PI * 2)
    ctx.fillStyle = '#8a8f96'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#5c666c' // Rock Shadow, art-refs/theme.md
    ctx.stroke()

    // Mặt nước xanh bên trong.
    ctx.beginPath()
    ctx.arc(cx, cy, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#4aa9f0' // River Base, art-refs/theme.md
    ctx.fill()

    // Mái gỗ nhỏ phía trên (hình tam giác dẹt) + 2 cột đỡ, gợi ý giếng có mái che.
    ctx.beginPath()
    ctx.moveTo(cx - 16, cy - 14)
    ctx.lineTo(cx + 16, cy - 14)
    ctx.lineTo(cx, cy - 24)
    ctx.closePath()
    ctx.fillStyle = '#9c6a3a' // Wood Base, art-refs/theme.md
    ctx.fill()
    ctx.fillStyle = '#714a28' // Wood Shadow
    ctx.fillRect(cx - 14, cy - 15, 3, 8)
    ctx.fillRect(cx + 11, cy - 15, 3, 8)

    canvasTexture.refresh()
    this.textures.get(WELL_TEXTURE).setFilter(Phaser.Textures.FilterMode.LINEAR)
  }

  /** Gà Quay tạm (vẽ bằng code, không cần asset riêng) — thân bầu dục nâu vàng cắm que xiên, 2 đùi gà nhô ra 2
   * bên, vài nét bóng sáng cho có độ ngậy. Placeholder, chưa có prompt art-refs nào cho vật phẩm này. */
  private createRoastChickenTexture() {
    if (this.textures.exists(ROAST_CHICKEN_TEXTURE)) return
    const width = 40
    const height = 34
    const canvasTexture = this.textures.createCanvas(ROAST_CHICKEN_TEXTURE, width, height)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const cx = width / 2
    const cy = height / 2 + 2

    // Que xiên gỗ xuyên qua thân, lộ 2 đầu.
    ctx.strokeStyle = '#9c6a3a' // Wood Base, art-refs/theme.md
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(2, cy)
    ctx.lineTo(width - 2, cy)
    ctx.stroke()

    // 2 đùi gà nhô ra 2 bên trước khi vẽ thân đè lên (nhìn như thân che gốc đùi).
    ctx.fillStyle = '#C97C3D'
    ctx.beginPath()
    ctx.ellipse(cx - 13, cy + 6, 7, 5, 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + 13, cy + 6, 7, 5, -0.6, 0, Math.PI * 2)
    ctx.fill()

    // Thân chính (bầu dục nâu vàng roasted).
    ctx.beginPath()
    ctx.ellipse(cx, cy, 15, 11, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#D9974A'
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = '#8A5A26'
    ctx.stroke()

    // Vệt bóng sáng phía trên cho có độ ngậy/bóng dầu.
    ctx.beginPath()
    ctx.ellipse(cx - 4, cy - 5, 6, 3, -0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 224, 168, 0.7)'
    ctx.fill()

    canvasTexture.refresh()
  }

  /** Tạo sẵn 1 lần UI túi đồ (ẩn ban đầu) — lưới cố định `INVENTORY_GRID_COLUMNS`×`INVENTORY_GRID_ROWS`, cùng
   * kiểu bảng xanh ngọc/viền sáng với menu hạt giống (`createSeedMenu()`) cho đồng bộ UI, dù panel khác hẳn về
   * layout (lưới nhiều ô, không phải 1 dải icon trượt). Icon dùng thẳng item icon (`crop_<id>_item`) đã
   * preload — khung từng ô vẽ bằng code (đặt tại đây làm placeholder), đổi qua khung thật khi có
   * `ui/frames/item_slot` từ `art-refs/ui/ui.md`. */
  private createInventoryUI() {
    const slotSize = INVENTORY_SLOT_SIZE
    const gap = INVENTORY_SLOT_GAP
    const paddingX = 16
    const paddingY = 14
    const columns = INVENTORY_GRID_COLUMNS
    const rows = INVENTORY_GRID_ROWS
    const slotCount = columns * rows

    const gridWidth = columns * slotSize + (columns - 1) * gap
    const gridHeight = rows * slotSize + (rows - 1) * gap
    this.inventoryPanelWidth = gridWidth + paddingX * 2
    this.inventoryPanelHeight = gridHeight + paddingY * 2 + 24 // +24 chỗ cho tiêu đề trên cùng

    const panel = this.add.graphics()
    panel.fillStyle(0x123a3f, 0.92)
    panel.fillRoundedRect(
      -this.inventoryPanelWidth / 2,
      -this.inventoryPanelHeight / 2,
      this.inventoryPanelWidth,
      this.inventoryPanelHeight,
      14
    )
    panel.lineStyle(2, 0x9fe8d8, 0.9)
    panel.strokeRoundedRect(
      -this.inventoryPanelWidth / 2,
      -this.inventoryPanelHeight / 2,
      this.inventoryPanelWidth,
      this.inventoryPanelHeight,
      14
    )

    const title = this.add
      .text(0, -this.inventoryPanelHeight / 2 + 14, 'Túi Đồ', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    const gridStartX = -gridWidth / 2 + slotSize / 2
    const gridStartY = -this.inventoryPanelHeight / 2 + 24 + paddingY + slotSize / 2 - 4

    const slotFrames: Phaser.GameObjects.Rectangle[] = []
    this.inventorySlotIcons = []
    this.inventorySlotTexts = []
    for (let index = 0; index < slotCount; index++) {
      const col = index % columns
      const row = Math.floor(index / columns)
      const x = gridStartX + col * (slotSize + gap)
      const y = gridStartY + row * (slotSize + gap)

      slotFrames.push(
        this.add.rectangle(x, y, slotSize, slotSize, 0x1a4a50, 0.7).setStrokeStyle(1, 0x9fe8d8, 0.6)
      )
      this.inventorySlotIcons.push(
        this.add
          .image(x, y, '__DEFAULT')
          .setDisplaySize(slotSize * 0.72, slotSize * 0.72)
          .setVisible(false)
      )
      this.inventorySlotTexts.push(
        this.add
          .text(x + slotSize / 2 - 3, y + slotSize / 2 - 3, '', {
            fontSize: '11px',
            color: '#ffffff',
            fontFamily: 'monospace'
          })
          .setOrigin(1, 1)
      )
    }

    this.inventoryContainer = this.add
      .container(this.scale.width / 2, this.scale.height / 2, [
        panel,
        title,
        ...slotFrames,
        ...this.inventorySlotIcons,
        ...this.inventorySlotTexts
      ])
      .setScrollFactor(0)
      .setDepth(INVENTORY_DEPTH)
      .setVisible(false)
  }

  private openInventory() {
    this.inventoryOpen = true
    this.refreshInventoryUI()
    this.inventoryContainer.setVisible(true)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  private closeInventory() {
    this.inventoryOpen = false
    this.inventoryContainer.setVisible(false)
  }

  /** Đổ lại toàn bộ nội dung túi đồ vào đúng số ô cố định đã tạo sẵn — gọi khi mở túi hoặc ngay sau khi thu
   * hoạch (để thấy số lượng mới ngay, không cần đóng/mở lại mới thấy). Ô nào không có item thì ẩn icon/text đi
   * (không destroy — object cố định, tái dùng liên tục, xem `createInventoryUI()`). */
  private refreshInventoryUI() {
    const slots = inventoryManager.getSlots()
    this.inventorySlotIcons.forEach((icon, index) => {
      const slot = slots[index]
      const text = this.inventorySlotTexts[index]
      if (!slot) {
        icon.setVisible(false)
        text.setText('')
        return
      }
      // Item icon của mỗi cây có kích thước GỐC khác hẳn nhau (giống bug đã gặp ở icon menu hạt giống) —
      // `setTexture()` không tự giữ display size cũ, PHẢI set lại mỗi lần đổi texture, không thì icon hiện to
      // lộn xộn theo đúng kích thước ảnh gốc (bug thật gặp khi verify bằng Puppeteer — carrot.png to lớn hơn cả
      // panel).
      icon
        .setTexture(this.cropItemTextureKey(slot.itemId))
        .setDisplaySize(INVENTORY_SLOT_SIZE * 0.72, INVENTORY_SLOT_SIZE * 0.72)
        .setVisible(true)
      text.setText(String(slot.quantity))
    })
  }

  /** `pointer.x/y` (toạ độ canvas) có nằm trong vùng bảng túi đồ hay không — cùng cách làm với
   * `isPointerInsideSeedMenu()`, panel này cũng `setScrollFactor(0)` nên so trực tiếp toạ độ canvas được. */
  private isPointerInsideInventory(pointer: Phaser.Input.Pointer): boolean {
    const halfWidth = this.inventoryPanelWidth / 2
    const halfHeight = this.inventoryPanelHeight / 2
    const cx = this.inventoryContainer.x
    const cy = this.inventoryContainer.y
    return (
      pointer.x >= cx - halfWidth &&
      pointer.x <= cx + halfWidth &&
      pointer.y >= cy - halfHeight &&
      pointer.y <= cy + halfHeight
    )
  }

  /** Tạo sẵn 1 lần bảng Công Cụ Nông Trại (ẩn ban đầu) — cùng kiểu bảng xanh ngọc/viền sáng với 2 bảng trên
   * cho đồng bộ UI. 2 ô nhập số (`bulkFromInput`/`bulkToInput`) là DOM Element thật (input HTML đè lên canvas,
   * xem comment ở khai báo field) — tắt hẳn bàn phím Phaser lúc đang gõ (`focus`/`blur`) để không vô tình bắn
   * trúng phím tắt 1 chữ khác (G/T/I/F...) đang lắng nghe toàn cục, xem giải thích trong `main.ts`. 4 nút bấm
   * còn lại vẽ bằng `Rectangle`+`Text` (giống mọi UI khác trong file này, không cần asset riêng). */
  private createBulkActionsUI() {
    const panelWidth = 300
    const panelHeight = 300
    this.bulkActionsPanelWidth = panelWidth
    this.bulkActionsPanelHeight = panelHeight
    const centerX = this.scale.width / 2
    const centerY = this.scale.height / 2

    const panel = this.add.graphics()
    panel.fillStyle(0x123a3f, 0.92)
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 14)
    panel.lineStyle(2, 0x9fe8d8, 0.9)
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 14)

    const title = this.add
      .text(0, -panelHeight / 2 + 14, 'Công Cụ Nông Trại', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    const totalTiles = this.farmManager.getTiles().length
    const rangeLabel = this.add
      .text(0, -panelHeight / 2 + 38, `Áp dụng cho ô có ID trong khoảng (0-${totalTiles - 1}):`, {
        fontSize: '11px',
        color: '#c8ffb0',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5)
    const hintLabel = this.add
      .text(
        0,
        -panelHeight / 2 + 96,
        'Để trống 1 hoặc cả 2 ô = không giới hạn phía đó (áp dụng tất cả)',
        {
          fontSize: '10px',
          color: '#9fe8d8',
          fontFamily: 'monospace'
        }
      )
      .setOrigin(0.5)

    this.bulkStatusText = this.add
      .text(0, panelHeight / 2 - 16, '', {
        fontSize: '11px',
        color: '#ffe9a8',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5)

    // Layout lưu lại thành field (`bulkButtonLayout`) để `handleBulkActionsClick()` tính đúng nút nào vừa bấm —
    // KHÔNG dùng `.setInteractive()`/`.on('pointerdown')` riêng cho từng nút dù Phaser hỗ trợ object tương tác
    // trong Container: hit-test của object tương tác lồng trong Container `scrollFactor(0)` bị lệch hẳn ngay
    // khi camera đã cuộn khỏi world (0,0) (hạn chế đã biết của Phaser, không phải lỗi code) — bug thật gặp khi
    // verify bằng Puppeteer (click đúng toạ độ hiện trên màn hình nhưng không trúng nút nào, vì hit-test tính
    // theo world-space lệch theo camera trong khi object vẽ theo screen-space cố định). Xử lý giống cách
    // `isPointerInsideSeedMenu()`/`isPointerInsideInventory()` đã làm từ trước: tự so sánh `pointer.x/y` (toạ
    // độ canvas, không qua world) với toạ độ từng nút trong 1 handler `pointerdown` chung ở `create()`.
    this.bulkButtonLayout = {
      width: panelWidth - 40,
      height: 32,
      gap: 8,
      firstY: -panelHeight / 2 + 118
    }
    const buttonLabels = ['Cuốc Tất Cả', 'Tưới Tất Cả', 'Gieo Hạt Tất Cả', 'Thu Hoạch Tất Cả']
    const buttonObjects: Phaser.GameObjects.GameObject[] = []
    this.bulkActionButtonTexts = []
    buttonLabels.forEach((label, index) => {
      const y =
        this.bulkButtonLayout.firstY +
        index * (this.bulkButtonLayout.height + this.bulkButtonLayout.gap)
      const bg = this.add
        .rectangle(0, y, this.bulkButtonLayout.width, this.bulkButtonLayout.height, 0x1a4a50, 0.9)
        .setStrokeStyle(1, 0x9fe8d8, 0.8)
      const text = this.add
        .text(0, y, label, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5)
      buttonObjects.push(bg, text)
      this.bulkActionButtonTexts.push(text)
    })

    this.bulkActionsContainer = this.add
      .container(centerX, centerY, [
        panel,
        title,
        rangeLabel,
        hintLabel,
        this.bulkStatusText,
        ...buttonObjects
      ])
      .setScrollFactor(0)
      .setDepth(BULK_ACTIONS_DEPTH)
      .setVisible(false)

    // 2 ô nhập số — KHÔNG thêm vào container ở trên (DOM Element không hỗ trợ làm con Container), tự đặt toạ
    // độ tuyệt đối trùng khớp vị trí trong bảng (ngay dưới `rangeLabel`) rồi `setScrollFactor(0)` riêng.
    const inputY = centerY - panelHeight / 2 + 58
    this.bulkFromInput = this.createRangeInput(centerX - 60, inputY, 'Từ #')
    this.bulkToInput = this.createRangeInput(centerX + 60, inputY, 'Đến #')
  }

  /** Tạo 1 ô nhập số DOM cho bảng Công Cụ Nông Trại — tắt bàn phím Phaser lúc focus/gõ để tránh phím tắt 1 chữ
   * (G/T/I/F...) đang lắng nghe toàn cục vô tình bắn trúng khi người chơi gõ số, bật lại lúc rời khỏi ô. */
  private createRangeInput(
    x: number,
    y: number,
    placeholder: string
  ): Phaser.GameObjects.DOMElement {
    const input = this.add.dom(x, y, 'input')
    input.node.setAttribute('type', 'number')
    input.node.setAttribute('placeholder', placeholder)
    ;(input.node as HTMLInputElement).style.width = '70px'
    ;(input.node as HTMLInputElement).style.fontFamily = 'monospace'
    ;(input.node as HTMLInputElement).style.fontSize = '12px'
    ;(input.node as HTMLInputElement).style.textAlign = 'center'
    // Phaser đo sẵn `width`/`height` từ kích thước THẬT của node ngay lúc `this.add.dom()` tạo ra nó — TRƯỚC
    // khi các dòng `.style.width=...` trên chạy, nên số đo cũ (kích thước input mặc định của browser, to hơn
    // 70px nhiều) vẫn còn lưu lại và bị dùng để tính offset theo origin (0.5 mặc định), khiến vị trí hiển thị
    // lệch hẳn so với toạ độ (x,y) truyền vào — click đúng toạ độ (x,y) sẽ trượt ra ngoài input thật (bug thật
    // gặp khi verify bằng Puppeteer: click ngay giữa vị trí tính toán nhưng không focus được input). Gọi lại
    // `updateSize()` để Phaser đo lại đúng 70px sau khi đã set style, hết lệch.
    input.updateSize()
    input
      .setScrollFactor(0)
      .setDepth(BULK_ACTIONS_DEPTH + 0.01)
      .setVisible(false)
    input.node.addEventListener('focus', () => {
      this.input.keyboard!.enabled = false
    })
    input.node.addEventListener('blur', () => {
      this.input.keyboard!.enabled = true
    })
    return input
  }

  private openBulkActions() {
    this.bulkActionsOpen = true
    const crop = GameData.crops.find((c) => c.id === this.selectedCropId)
    this.bulkActionButtonTexts[2].setText(`Gieo Hạt Tất Cả (${crop?.name ?? this.selectedCropId})`)
    this.bulkStatusText.setText('')
    this.bulkActionsContainer.setVisible(true)
    this.bulkFromInput.setVisible(true)
    this.bulkToInput.setVisible(true)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  private closeBulkActions() {
    this.bulkActionsOpen = false
    // Rời focus khỏi ô nhập nếu đang gõ — không thì bàn phím Phaser vẫn bị tắt (đã disable lúc focus) dù bảng
    // đã ẩn, làm mọi phím tắt khác đột nhiên "chết" sau khi đóng bảng bằng Esc/click ra ngoài.
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    this.bulkActionsContainer.setVisible(false)
    this.bulkFromInput.setVisible(false)
    this.bulkToInput.setVisible(false)
  }

  /** `pointer.x/y` có nằm trong vùng bảng Công Cụ Nông Trại hay không — cùng cách làm với
   * `isPointerInsideSeedMenu()`/`isPointerInsideInventory()`. */
  private isPointerInsideBulkActions(pointer: Phaser.Input.Pointer): boolean {
    const halfWidth = this.bulkActionsPanelWidth / 2
    const halfHeight = this.bulkActionsPanelHeight / 2
    const cx = this.bulkActionsContainer.x
    const cy = this.bulkActionsContainer.y
    return (
      pointer.x >= cx - halfWidth &&
      pointer.x <= cx + halfWidth &&
      pointer.y >= cy - halfHeight &&
      pointer.y <= cy + halfHeight
    )
  }

  /** Tự hit-test 4 nút bằng toạ độ (thay cho `.setInteractive()`, xem giải thích ở `createBulkActionsUI()`) —
   * quy `pointer.x/y` (toạ độ canvas) về hệ toạ độ LOCAL của container (trừ đi vị trí container), rồi so với
   * đúng khối chữ nhật của từng nút đã lưu trong `bulkButtonLayout`. */
  private handleBulkActionsClick(pointer: Phaser.Input.Pointer) {
    const localX = pointer.x - this.bulkActionsContainer.x
    const localY = pointer.y - this.bulkActionsContainer.y
    const { width, height, gap, firstY } = this.bulkButtonLayout
    const actions = [
      () => this.tillAllInRange(),
      () => this.waterAllInRange(),
      () => this.plantAllInRange(),
      () => this.harvestAllInRange()
    ]
    actions.forEach((action, index) => {
      const buttonY = firstY + index * (height + gap)
      const insideButton =
        localX >= -width / 2 &&
        localX <= width / 2 &&
        localY >= buttonY - height / 2 &&
        localY <= buttonY + height / 2
      if (insideButton) action()
    })
  }

  /** Đọc khoảng ID từ 2 ô nhập — ô trống (hoặc không phải số) coi như "không giới hạn" phía đó, đúng yêu cầu
   * "không chọn là làm tất cả". */
  private getBulkActionRange(): { min: number; max: number } {
    const fromRaw = (this.bulkFromInput.node as HTMLInputElement).value.trim()
    const toRaw = (this.bulkToInput.node as HTMLInputElement).value.trim()
    const min = fromRaw === '' ? -Infinity : Number(fromRaw)
    const max = toRaw === '' ? Infinity : Number(toRaw)
    return {
      min: Number.isNaN(min) ? -Infinity : min,
      max: Number.isNaN(max) ? Infinity : max
    }
  }

  private tillAllInRange() {
    const { min, max } = this.getBulkActionRange()
    let count = 0
    for (const tile of this.farmManager.getTiles()) {
      if (tile.id < min || tile.id > max) continue
      if (this.farmManager.till(tile)) count++
    }
    this.bulkStatusText.setText(`Đã cuốc ${count} ô`)
  }

  private waterAllInRange() {
    const { min, max } = this.getBulkActionRange()
    let count = 0
    for (const tile of this.farmManager.getTiles()) {
      if (tile.id < min || tile.id > max) continue
      if (this.farmManager.water(tile)) {
        this.playWaterFx(tile.x, tile.y)
        count++
      }
    }
    this.bulkStatusText.setText(`Đã tưới ${count} ô`)
  }

  /** Gieo hạt đang chọn (giống nút xác nhận trong menu hạt giống, xem `selectedCropId`) lên mọi ô `tilled`
   * trong khoảng — ô sai loại đất (ví dụ hạt thường lên ô nước) bị `plant()` từ chối thầm lặng như bình
   * thường, không tính vào số ô gieo thành công. */
  private plantAllInRange() {
    const { min, max } = this.getBulkActionRange()
    let count = 0
    for (const tile of this.farmManager.getTiles()) {
      if (tile.id < min || tile.id > max) continue
      if (this.farmManager.plant(tile, this.selectedCropId)) count++
    }
    this.bulkStatusText.setText(`Đã gieo ${count} ô`)
  }

  private harvestAllInRange() {
    const { min, max } = this.getBulkActionRange()
    const currentHour = this.timeManager.getHour()
    let count = 0
    for (const tile of this.farmManager.getTiles()) {
      if (tile.id < min || tile.id > max) continue
      const result = this.farmManager.harvest(tile, currentHour)
      if (!result) continue
      inventoryManager.addItem(result.cropId, result.quantity)
      this.playHarvestFx(result.cropId, result.quantity, tile.x, tile.y)
      count++
    }
    if (count > 0) this.refreshInventoryUI()
    this.bulkStatusText.setText(`Đã thu hoạch ${count} ô`)
  }
}
