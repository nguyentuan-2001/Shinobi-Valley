import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { GameData } from '../data/DataLoader'
import { NPC_PLACEMENTS } from '../data/npcPlacements'
import { NPC_FAVORITE_GIFTS } from '../data/npcGifts'
import { VILLAGE_EXIT_ZONES, FARM_EXIT_ZONES } from '../data/mapTransitions'
import { checkExitZones, fadeOutToScene, fadeInScene } from '../systems/SceneTransition'
import { placePortalAtZone } from '../systems/PortalVisual'
import { syncCombatHudToRegistry } from '../systems/CombatHud'
import { combatManager } from '../systems/CombatManager'
import { inventoryManager } from '../systems/InventoryManager'
import { npcRelationshipManager } from '../systems/NpcRelationshipManager'
import { getBuyCatalog, getSellableInventory, type ShopCatalogEntry } from '../systems/Shop'
import type { CharacterPanel } from '../systems/CharacterPanel'
import { UIScene } from './UIScene'

const MAP_WIDTH = 960
const MAP_HEIGHT = 600
const GROUND_TEXTURE = 'village_ground_bg'
const NPC_TEXTURE_PREFIX = 'npc_sprite_'
/** Đứng đủ gần 1 NPC để tương tác — cùng tinh thần `ANIMAL_INTERACT_RADIUS`/`ROAST_CHICKEN_INTERACT_RADIUS` ở
 * `GameScene`, đủ rộng để không cần đứng chính xác lên đúng toạ độ NPC. */
const NPC_INTERACT_RADIUS = 45
const DEFAULT_SPAWN = FARM_EXIT_ZONES[2].entryPoint
const DIALOGUE_DEPTH = 1_000_000
const SHOP_DEPTH = DIALOGUE_DEPTH + 1

/** Map 0 — Làng Ẩn Nhân (Sprint 10, xem `docs/world/npc.md`/`docs/world/maps.md`) — 10 NPC chính, hộp thoại
 * mặc định, quan hệ 0-10 (nói chuyện mỗi ngày/tặng quà yêu thích), shop mua/bán ở 3 NPC có catalog thật (Cô
 * Nông Lan bán hạt giống, Thợ Rèn Kim bán vũ khí, Người Thu Mua mua lại đồ trong túi) — 7 NPC còn lại chỉ có
 * hội thoại mặc định vì vai trò của họ (thuốc/gacha/lore/dạy kỹ năng) cần hệ thống chưa code (xem
 * `docs/planning/progress.md` Sprint 10 mục "Chưa làm"). Chưa có bản đồ làng thật — nền vẽ bằng code, NPC là
 * hình tròn màu placeholder, giống cách `TrainingGroundScene` xử lý Bãi Tập Luyện lúc chưa có asset. */
export class VillageScene extends Phaser.Scene {
  private player!: Player
  private isTransitioning = true
  private readonly npcImages = new Map<string, Phaser.GameObjects.Image>()
  private nearestNpcId: string | null = null
  private hintText?: Phaser.GameObjects.Text

  private dialogueContainer!: Phaser.GameObjects.Container
  private dialogueText!: Phaser.GameObjects.Text
  private dialogueOpen = false

  private shopContainer!: Phaser.GameObjects.Container
  private shopTitleText!: Phaser.GameObjects.Text
  private shopItemText!: Phaser.GameObjects.Text
  private shopHintText!: Phaser.GameObjects.Text
  private shopOpen = false
  private shopNpcId: string | null = null
  private shopMode: 'buy' | 'sell' = 'buy'
  private shopCatalog: ShopCatalogEntry[] = []
  private shopIndex = 0

  constructor() {
    super({ key: 'VillageScene' })
  }

  create(data: { spawnX?: number; spawnY?: number }) {
    this.createGroundTexture()
    this.add.image(0, 0, GROUND_TEXTURE).setOrigin(0, 0).setDepth(-10000)
    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)

    this.placeNpcs()
    for (const zone of VILLAGE_EXIT_ZONES) placePortalAtZone(this, zone)

    const spawnX = data?.spawnX ?? DEFAULT_SPAWN.x
    const spawnY = data?.spawnY ?? DEFAULT_SPAWN.y
    this.player = new Player(this, spawnX, spawnY, 'vegeta')

    this.cameras.main.startFollow(this.player, true)
    syncCombatHudToRegistry(this)
    this.scene.launch('UIScene')

    this.createDialogueUI()
    this.createShopUI()
    this.bindInput()

    this.add
      .text(
        8,
        8,
        'Làng Ẩn Nhân — Enter: nói chuyện | F: cửa hàng (nếu có) | G: tặng quà yêu thích | C: bảng nhân vật. Bước vào cổng dịch chuyển để quay lại Farm.',
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 6, y: 4 }
        }
      )
      .setScrollFactor(0)
      .setDepth(2000)

    fadeInScene(this, () => {
      this.isTransitioning = false
    })
  }

  update() {
    const uiOpen = this.dialogueOpen || this.shopOpen || !!this.getCharacterPanel()?.isOpen
    if (!this.isTransitioning && !uiOpen) {
      this.player.update()
      const exit = checkExitZones(this.player.x, this.player.y, VILLAGE_EXIT_ZONES)
      if (exit) {
        this.isTransitioning = true
        fadeOutToScene(this, exit.targetScene, exit.entryPoint)
      }
    }
    this.syncNearestNpc()
  }

  private getCharacterPanel(): CharacterPanel | undefined {
    return (this.scene.get('UIScene') as UIScene | null)?.characterPanel
  }

  /** Đặt 10 NPC placeholder lên map — ảnh hình tròn màu riêng (`createNpcTexture()`) + tên + tên công trình
   * (`buildingLabel`) đứng phía trên, tất cả TĨNH (không có AI/di chuyển — dev-schedule.md không yêu cầu NPC
   * đi lại/theo lịch trình ở V1). */
  private placeNpcs() {
    for (const placement of NPC_PLACEMENTS) {
      const npc = GameData.npcs.find((n) => n.id === placement.npcId)
      if (!npc) continue
      this.createNpcTexture(placement.npcId, placement.color)
      const image = this.add
        .image(placement.x, placement.y, NPC_TEXTURE_PREFIX + placement.npcId)
        .setDisplaySize(32, 32)
        .setDepth(placement.y)
      this.npcImages.set(placement.npcId, image)

      this.add
        .text(placement.x, placement.y - 26, `${npc.name}\n(${placement.buildingLabel})`, {
          fontSize: '9px',
          color: '#ffffff',
          fontFamily: 'monospace',
          align: 'center',
          backgroundColor: '#00000066',
          padding: { x: 2, y: 1 }
        })
        .setOrigin(0.5, 1)
        .setDepth(placement.y + 0.1)
    }
  }

  /** Hình tròn màu placeholder (chưa có sprite thật — `art-refs/characters/npcs.md` có mô tả nhưng chưa gen
   * ảnh) — 1 vòng tròn thân + 1 vòng tròn nhỏ "đầu" phía trên để gợi ý hình người tối thiểu, mỗi NPC 1 màu
   * riêng (`NpcPlacement.color`) để phân biệt khi đứng cạnh nhau. */
  private createNpcTexture(npcId: string, color: number) {
    const key = NPC_TEXTURE_PREFIX + npcId
    if (this.textures.exists(key)) return
    const size = 32
    const canvasTexture = this.textures.createCanvas(key, size, size)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    const hex = `#${color.toString(16).padStart(6, '0')}`

    ctx.fillStyle = hex
    ctx.beginPath()
    ctx.ellipse(size / 2, size * 0.68, size * 0.32, size * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(size / 2, size * 0.32, size * 0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    canvasTexture.refresh()
  }

  /** Gọi mỗi frame — tìm NPC gần nhất trong bán kính tương tác, hiện gợi ý phía trên đúng 1 NPC đó (cùng bài học
   * "chỉ hiện 1 chỗ đang trỏ vào" đã áp dụng cho ô đất/chuồng trại/điểm câu cá ở `GameScene`). Không hiện gợi ý
   * khi đang mở dialogue/shop (đỡ rối, với lại lúc đó cũng không thể mở thêm gì khác). */
  private syncNearestNpc() {
    if (this.dialogueOpen || this.shopOpen) {
      this.nearestNpcId = null
      this.hintText?.destroy()
      this.hintText = undefined
      return
    }

    let nearest: (typeof NPC_PLACEMENTS)[number] | undefined
    let nearestDistance = NPC_INTERACT_RADIUS
    for (const placement of NPC_PLACEMENTS) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        placement.x,
        placement.y
      )
      if (distance <= nearestDistance) {
        nearest = placement
        nearestDistance = distance
      }
    }

    this.nearestNpcId = nearest?.npcId ?? null

    if (!nearest) {
      this.hintText?.destroy()
      this.hintText = undefined
      return
    }

    const npc = GameData.npcs.find((n) => n.id === nearest!.npcId)
    const parts = ['Enter: Nói chuyện']
    if (npc?.shop_type) parts.push('F: Cửa hàng')
    if ((NPC_FAVORITE_GIFTS[nearest.npcId] ?? []).length > 0) parts.push('G: Tặng quà')
    const label = parts.join(' | ')

    if (!this.hintText) {
      this.hintText = this.add
        .text(nearest.x, nearest.y - 46, label, {
          fontSize: '9px',
          color: '#bfe8ff',
          fontFamily: 'monospace',
          backgroundColor: '#00000088',
          padding: { x: 3, y: 1 }
        })
        .setOrigin(0.5)
        .setDepth(999_999)
    } else {
      this.hintText.setText(label).setPosition(nearest.x, nearest.y - 46)
    }
  }

  private bindInput() {
    this.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
      if (event.repeat) return
      event.preventDefault()
      this.handleEnter()
    })
    this.input.keyboard!.on('keydown-F', (event: KeyboardEvent) => {
      if (event.repeat || this.dialogueOpen || this.getCharacterPanel()?.isOpen) return
      event.preventDefault()
      this.tryOpenShop()
    })
    this.input.keyboard!.on('keydown-G', (event: KeyboardEvent) => {
      if (event.repeat || this.dialogueOpen || this.shopOpen || this.getCharacterPanel()?.isOpen)
        return
      event.preventDefault()
      this.tryGiveGift()
    })
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      if (event.repeat) return
      if (this.dialogueOpen) {
        event.preventDefault()
        this.closeDialogue()
      } else if (this.shopOpen) {
        event.preventDefault()
        this.closeShop()
      }
    })
    this.input.keyboard!.on('keydown-LEFT', (event: KeyboardEvent) => {
      if (!this.shopOpen || event.repeat) return
      event.preventDefault()
      this.moveShopSelection(-1)
    })
    this.input.keyboard!.on('keydown-RIGHT', (event: KeyboardEvent) => {
      if (!this.shopOpen || event.repeat) return
      event.preventDefault()
      this.moveShopSelection(1)
    })
  }

  /** Enter — 3 nấc tuỳ trạng thái: đang mở shop thì XÁC NHẬN giao dịch; đang mở dialogue thì ĐÓNG lại (bấm lần
   * nữa để đóng, đơn giản hơn hẳn so với thêm phím riêng); không mở gì và đứng gần 1 NPC thì MỞ dialogue. */
  private handleEnter() {
    if (this.shopOpen) {
      this.confirmShopTransaction()
      return
    }
    if (this.dialogueOpen) {
      this.closeDialogue()
      return
    }
    if (this.nearestNpcId) this.openDialogue(this.nearestNpcId)
  }

  // ─── Dialogue ────────────────────────────────────────────────────────────────────────────────────────

  private createDialogueUI() {
    const panelWidth = 500
    const panelHeight = 90
    const panel = this.add
      .rectangle(0, 0, panelWidth, panelHeight, 0x102030, 0.92)
      .setStrokeStyle(2, 0xbfe8ff)
    this.dialogueText = this.add
      .text(0, 0, '', {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
        wordWrap: { width: panelWidth - 32 },
        align: 'left'
      })
      .setOrigin(0.5)

    this.dialogueContainer = this.add
      .container(this.scale.width / 2, this.scale.height - 80, [panel, this.dialogueText])
      .setScrollFactor(0)
      .setDepth(DIALOGUE_DEPTH)
      .setVisible(false)
  }

  /** Mở hộp thoại với đúng `dialogue_default` của NPC, đồng thời tính điểm quan hệ "nói chuyện hôm nay" (chỉ
   * cộng lần đầu trong ngày — xem `NpcRelationshipManager.talk()`) — báo thêm dòng "+1 quan hệ" khi vừa cộng
   * được, để người chơi biết hành động của mình có tác dụng. */
  private openDialogue(npcId: string) {
    const npc = GameData.npcs.find((n) => n.id === npcId)
    if (!npc) return
    const gained = npcRelationshipManager.talk(npcId)
    const points = npcRelationshipManager.getPoints(npcId)
    const suffix = gained
      ? `\n\n(+1 quan hệ — hiện tại: ${points}/10)`
      : `\n\n(Quan hệ: ${points}/10)`
    this.dialogueText.setText(`${npc.name}: "${npc.dialogue_default}"${suffix}`)
    this.dialogueOpen = true
    this.dialogueContainer.setVisible(true)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  private closeDialogue() {
    this.dialogueOpen = false
    this.dialogueContainer.setVisible(false)
  }

  // ─── Tặng quà ────────────────────────────────────────────────────────────────────────────────────────

  /** Tự động tìm trong túi đồ 1 item khớp danh sách quà yêu thích của NPC gần nhất rồi tặng luôn — không cần UI
   * chọn item riêng (đơn giản hoá: chỉ có đúng 1-2 item/NPC trong `npcGifts.ts`, tự tìm là đủ, không cần người
   * chơi tự chọn giữa nhiều lựa chọn tương đương). */
  private tryGiveGift() {
    if (!this.nearestNpcId) return
    const favorites = NPC_FAVORITE_GIFTS[this.nearestNpcId] ?? []
    if (favorites.length === 0) {
      this.showFloatingMessage('NPC này chưa nhận quà được (chưa có vật phẩm phù hợp trong game)')
      return
    }

    const owned = favorites.find((itemId) =>
      inventoryManager.getSlots().some((slot) => slot.itemId === itemId && slot.quantity > 0)
    )
    if (!owned) {
      this.showFloatingMessage('Bạn không có quà nào NPC này thích trong túi đồ')
      return
    }

    if (!inventoryManager.removeItem(owned, 1)) return
    const result = npcRelationshipManager.giveGift(this.nearestNpcId, owned)
    if (result === 'already_today') {
      inventoryManager.addItem(owned, 1) // hoàn lại — đã tặng hôm nay rồi, không tiêu phí đồ vô ích
      this.showFloatingMessage('Đã tặng quà hôm nay rồi, mai quay lại nhé')
      return
    }
    const points = npcRelationshipManager.getPoints(this.nearestNpcId)
    this.showFloatingMessage(`Tặng quà thành công! (+2 quan hệ — hiện tại: ${points}/10)`)
  }

  private showFloatingMessage(text: string) {
    const msg = this.add
      .text(this.player.x, this.player.y - 40, text, {
        fontSize: '10px',
        color: '#ffe9a8',
        fontFamily: 'monospace',
        backgroundColor: '#00000088',
        padding: { x: 3, y: 1 },
        wordWrap: { width: 220 },
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(999_999)
    this.time.delayedCall(1800, () => msg.destroy())
  }

  // ─── Shop ────────────────────────────────────────────────────────────────────────────────────────────

  private createShopUI() {
    const panelWidth = 320
    const panelHeight = 110
    const panel = this.add
      .rectangle(0, 0, panelWidth, panelHeight, 0x102030, 0.94)
      .setStrokeStyle(2, 0xffd76a)
    this.shopTitleText = this.add
      .text(0, -38, '', { fontSize: '13px', color: '#ffd76a', fontFamily: 'monospace' })
      .setOrigin(0.5)
    this.shopItemText = this.add
      .text(0, -6, '', {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center'
      })
      .setOrigin(0.5)
    this.shopHintText = this.add
      .text(0, 34, '←/→ chọn · Enter: xác nhận · Esc: đóng', {
        fontSize: '10px',
        color: '#aaaaaa',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5)

    this.shopContainer = this.add
      .container(this.scale.width / 2, this.scale.height - 100, [
        panel,
        this.shopTitleText,
        this.shopItemText,
        this.shopHintText
      ])
      .setScrollFactor(0)
      .setDepth(SHOP_DEPTH)
      .setVisible(false)
  }

  /** Mở shop của NPC gần nhất — `shop_type: "sell_all"` (Người Thu Mua) là chế độ BÁN với catalog ĐỘNG (đọc
   * thẳng túi đồ hiện có), mọi `shop_type` khác là chế độ MUA với catalog CỐ ĐỊNH (`getBuyCatalog()`). Không mở
   * được nếu NPC không có shop hoặc catalog rỗng (chưa có gì để bán/mua — báo rõ lý do thay vì mở 1 bảng trống
   * gây khó hiểu). */
  private tryOpenShop() {
    if (!this.nearestNpcId) return
    const npc = GameData.npcs.find((n) => n.id === this.nearestNpcId)
    if (!npc?.shop_type) {
      this.showFloatingMessage('NPC này chưa có cửa hàng')
      return
    }

    this.shopNpcId = npc.id
    this.shopMode = npc.shop_type === 'sell_all' ? 'sell' : 'buy'
    this.refreshShopCatalog()

    if (this.shopCatalog.length === 0) {
      this.showFloatingMessage(
        this.shopMode === 'sell'
          ? 'Bạn không có gì để bán'
          : 'Cửa hàng này chưa có gì để bán (chờ Sprint sau)'
      )
      this.shopNpcId = null
      return
    }

    this.shopIndex = 0
    this.shopOpen = true
    this.shopContainer.setVisible(true)
    this.shopTitleText.setText(`${npc.name} — ${this.shopMode === 'buy' ? 'MUA' : 'BÁN'}`)
    this.updateShopDisplay()
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
  }

  private refreshShopCatalog() {
    if (!this.shopNpcId) return
    const npc = GameData.npcs.find((n) => n.id === this.shopNpcId)
    this.shopCatalog =
      this.shopMode === 'sell' ? getSellableInventory() : getBuyCatalog(npc?.shop_type ?? null)
  }

  private moveShopSelection(direction: -1 | 1) {
    const count = this.shopCatalog.length
    if (count === 0) return
    this.shopIndex = (this.shopIndex + direction + count) % count
    this.updateShopDisplay()
  }

  private updateShopDisplay() {
    const entry = this.shopCatalog[this.shopIndex]
    if (!entry) {
      this.shopItemText.setText('(Hết hàng)')
      return
    }
    const gold = combatManager.getStats().gold
    if (this.shopMode === 'buy') {
      const finalPrice = this.shopNpcId
        ? npcRelationshipManager.applyDiscount(this.shopNpcId, entry.price)
        : entry.price
      const discountNote = finalPrice < entry.price ? ` (giảm từ ${entry.price}đ)` : ''
      this.shopItemText.setText(
        `${entry.name}\nGiá: ${finalPrice}đ${discountNote}\n(${this.shopIndex + 1}/${this.shopCatalog.length}) · Bạn có: ${gold}đ`
      )
    } else {
      const owned =
        inventoryManager
          .getSlots()
          .filter((s) => s.itemId === entry.itemId)
          .reduce((sum, s) => sum + s.quantity, 0) ?? 0
      this.shopItemText.setText(
        `${entry.name} ×${owned}\nBán tất cả: +${entry.price * owned}đ\n(${this.shopIndex + 1}/${this.shopCatalog.length})`
      )
    }
  }

  /** Enter khi shop đang mở — MUA: trừ tiền (đã áp giảm giá quan hệ nếu đủ điều kiện) + cộng đúng 1 item vào
   * túi, không đủ tiền thì báo chứ không trừ. BÁN: bán TOÀN BỘ số lượng đang có của item đang chọn (đơn giản
   * hoá — không có UI chọn số lượng riêng), cộng tiền đúng số lượng × giá, rồi làm mới catalog (item vừa bán
   * hết sẽ biến mất khỏi danh sách động). */
  private confirmShopTransaction() {
    const entry = this.shopCatalog[this.shopIndex]
    if (!entry || !this.shopNpcId) return

    if (this.shopMode === 'buy') {
      const finalPrice = npcRelationshipManager.applyDiscount(this.shopNpcId, entry.price)
      if (!combatManager.spendGold(finalPrice)) {
        this.showFloatingMessage('Không đủ tiền')
        return
      }
      inventoryManager.addItem(entry.itemId, 1)
      this.showFloatingMessage(`Đã mua ${entry.name}`)
      this.updateShopDisplay()
      return
    }

    const owned = inventoryManager
      .getSlots()
      .filter((s) => s.itemId === entry.itemId)
      .reduce((sum, s) => sum + s.quantity, 0)
    if (owned <= 0) return
    inventoryManager.removeItem(entry.itemId, owned)
    combatManager.addGold(entry.price * owned)
    this.showFloatingMessage(`Đã bán ${owned} ${entry.name} (+${entry.price * owned}đ)`)

    this.refreshShopCatalog()
    if (this.shopCatalog.length === 0) {
      this.closeShop()
      return
    }
    this.shopIndex = Math.min(this.shopIndex, this.shopCatalog.length - 1)
    this.updateShopDisplay()
  }

  private closeShop() {
    this.shopOpen = false
    this.shopNpcId = null
    this.shopContainer.setVisible(false)
  }

  /** Nền đất tạm (vẽ bằng code, giống `TrainingGroundScene.createGroundTexture()`) — màu be/vàng nhạt gợi ý
   * "quảng trường làng" thay vì cỏ Farm/đất Bãi Tập Luyện, có kẻ ô mờ cho đỡ trống trải. */
  private createGroundTexture() {
    if (this.textures.exists(GROUND_TEXTURE)) return
    const canvasTexture = this.textures.createCanvas(GROUND_TEXTURE, MAP_WIDTH, MAP_HEIGHT)
    if (!canvasTexture) return
    const ctx = canvasTexture.getContext()
    ctx.fillStyle = '#D9C48A'
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT)
    ctx.strokeStyle = 'rgba(150,120,70,0.3)'
    ctx.lineWidth = 1
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, MAP_HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(MAP_WIDTH, y)
      ctx.stroke()
    }
    canvasTexture.refresh()
  }
}
