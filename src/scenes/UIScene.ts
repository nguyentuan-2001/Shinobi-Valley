import Phaser from 'phaser'
import { CharacterPanel, bindCharacterPanelInput } from '../systems/CharacterPanel'
import { ControlsHelpPanel, bindControlsHelpInput } from '../systems/ControlsHelp'
import type { ControlEntry } from '../data/controlsHelp'

export class UIScene extends Phaser.Scene {
  /** Bảng nhân vật PHẢI sống ở đây, không phải ở scene gameplay đang active (Game/Grassland/TrainingGround) —
   * Phaser xếp thứ tự vẽ giữa các scene THEO SCENE, không theo `depth` (depth chỉ so sánh được giữa object
   * CÙNG 1 scene) — `UIScene` được `launch()` SAU nên luôn vẽ đè lên scene gameplay, đúng ý cho HUD. Nếu tạo
   * `CharacterPanel` bên trong `GameScene` như lần đầu thử, panel bị đúng chữ HUD (Lv./EXP...) của `UIScene` đè
   * lên khi 2 vùng chồng nhau — bug thật gặp khi verify bằng Puppeteer (chữ HUD lộ ra giữa panel dù panel có
   * background gần như đục). Các scene gameplay chỉ ĐỌC lại instance này qua `getCharacterPanel()` (xem đó ở
   * mỗi scene), không tự tạo riêng. */
  characterPanel!: CharacterPanel
  /** Bảng phím tắt (Z) — cùng lý do sống ở `UIScene` như `characterPanel` ở trên. Nội dung đọc động từ registry
   * `controlsHelpEntries`, mỗi scene gameplay tự ghi danh sách phím riêng của nó (xem `data/controlsHelp.ts`). */
  private controlsHelpPanel!: ControlsHelpPanel

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.characterPanel = new CharacterPanel(this)
    bindCharacterPanelInput(this, this.characterPanel)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
      this.characterPanel.handlePointerDown(pointer)
    )

    this.controlsHelpPanel = new ControlsHelpPanel(this)
    bindControlsHelpInput(
      this,
      this.controlsHelpPanel,
      () => (this.registry.get('controlsHelpEntries') as ControlEntry[] | undefined) ?? []
    )

    // Esc ưu tiên đóng bảng phím tắt trước (nếu đang mở) rồi mới tới bảng nhân vật — 2 bảng không mở cùng lúc
    // trong thực tế (Z/C đều chỉ toggle của riêng mình) nhưng vẫn cần thứ tự rõ ràng phòng hờ.
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      if (event.repeat) return
      if (this.controlsHelpPanel.isOpen) {
        event.preventDefault()
        this.controlsHelpPanel.close()
      } else if (this.characterPanel.isOpen) {
        event.preventDefault()
        this.characterPanel.close()
      }
    })

    // UI chạy song song với GameScene/TrainingGroundScene/GrasslandScene (không replace) — HP/MP/EXP giờ đọc
    // THẬT từ `registry` (do `systems/CombatHud.ts` ghi vào, nguồn là singleton `CombatManager` sống xuyên suốt
    // mọi scene, xem giải thích ở đó), không còn là số giả cố định như trước Sprint 5.
    const hpText = this.add.text(8, 8, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    const mpText = this.add.text(8, 28, '', {
      fontSize: '14px',
      color: '#aaaaff',
      fontFamily: 'monospace'
    })
    const levelText = this.add.text(8, 48, '', {
      fontSize: '14px',
      color: '#ffff88',
      fontFamily: 'monospace'
    })
    // Sprint 10 — `playerGold` đã được `CombatHud.ts` ghi vào registry từ Sprint 5 nhưng CHƯA từng có nơi nào
    // hiển thị (rà lại lúc làm shop NPC mới phát hiện) — thêm dòng hiện luôn ở đây, cần thiết để người chơi biết
    // còn bao nhiêu tiền khi đứng trước shop.
    const goldText = this.add.text(8, 68, '', {
      fontSize: '14px',
      color: '#ffd76a',
      fontFamily: 'monospace'
    })

    const updateCombatHud = () => {
      hpText.setText(
        `HP: ${this.registry.get('playerHp') ?? 0} / ${this.registry.get('playerMaxHp') ?? 0}`
      )
      mpText.setText(
        `MP: ${this.registry.get('playerMp') ?? 0} / ${this.registry.get('playerMaxMp') ?? 0}`
      )
      levelText.setText(
        `Lv. ${this.registry.get('playerLevel') ?? 1} | EXP: ${this.registry.get('playerExp') ?? 0} / ${this.registry.get('playerExpToNext') ?? 100}`
      )
      goldText.setText(`Đồng: ${this.registry.get('playerGold') ?? 0}đ`)
    }
    updateCombatHud()
    const combatHudKeys = [
      'playerHp',
      'playerMaxHp',
      'playerMp',
      'playerMaxMp',
      'playerLevel',
      'playerExp',
      'playerExpToNext',
      'playerGold'
    ]
    const onCombatStatChange = () => updateCombatHud()
    for (const key of combatHudKeys)
      this.registry.events.on(`changedata-${key}`, onCombatStatChange)

    // Hạt giống đang chọn (Sprint 2, thay tạm cho hotbar/inventory thật ở Sprint 4) — GameScene ghi tên qua
    // `this.registry` (DataManager toàn cục dùng chung mọi scene), ở đây chỉ đọc + tự cập nhật khi đổi.
    const seedText = this.add.text(8, 88, '', {
      fontSize: '14px',
      color: '#c8ffb0',
      fontFamily: 'monospace'
    })
    const updateSeedText = (name: string) =>
      seedText.setText(
        `Hạt giống: ${name} (Enter: cuốc/trồng/tưới/hái · ←/→ chọn hạt · I: túi đồ · F: công cụ nông trại)`
      )
    updateSeedText(this.registry.get('selectedSeedName') ?? '')
    const onSeedNameChange = (_parent: unknown, name: string) => updateSeedText(name)
    this.registry.events.on('changedata-selectedSeedName', onSeedNameChange)

    // Ngày/giờ trong game (Sprint 3) — góc trên-phải, tách khỏi cụm HP/MP/EXP/hạt giống bên trái cho dễ phân biệt.
    const timeText = this.add
      .text(this.scale.width - 8, 8, '', {
        fontSize: '14px',
        color: '#ffe9a8',
        fontFamily: 'monospace'
      })
      .setOrigin(1, 0)
    timeText.setText(this.registry.get('gameTimeText') ?? '')
    const onGameTimeChange = (_parent: unknown, text: string) => timeText.setText(text)
    this.registry.events.on('changedata-gameTimeText', onGameTimeChange)

    // `this.registry` là DataManager TOÀN CỤC (dùng chung mọi scene, xem comment ở trên) — `registry.events`
    // cũng vậy, không tự huỷ theo vòng đời scene này. Nếu không tự gỡ khi scene dừng (bấm Q quay lại GameScene
    // rồi bấm Q lần nữa vào lại Editor), listener cũ vẫn treo lơ lửng trên bus toàn cục; lần ghi registry tiếp
    // theo (`GameScene.selectSeed()`) sẽ gọi `.setText()` lên đúng các Text object CỦA INSTANCE CŨ đã bị destroy
    // theo scene — ném lỗi giữa chừng `create()` của scene mới, làm scene mới khởi tạo dở dang, tưởng như "bấm Q
    // không thoát được" (bug thật đã gặp, xem progress.md). Phải gỡ đúng bằng named handler khi scene shutdown.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('changedata-selectedSeedName', onSeedNameChange)
      this.registry.events.off('changedata-gameTimeText', onGameTimeChange)
      for (const key of combatHudKeys)
        this.registry.events.off(`changedata-${key}`, onCombatStatChange)
    })
  }
}
