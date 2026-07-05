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

    // Hạt giống đang chọn (Sprint 2, thay tạm cho hotbar/inventory thật ở Sprint 4) — GameScene ghi tên qua
    // `this.registry` (DataManager toàn cục dùng chung mọi scene), ở đây chỉ đọc + tự cập nhật khi đổi.
    const seedText = this.add.text(8, 72, '', {
      fontSize: '14px',
      color: '#c8ffb0',
      fontFamily: 'monospace'
    })
    const updateSeedText = (name: string) =>
      seedText.setText(`Hạt giống: ${name} (Enter cuốc/mở menu, ←/→ chọn hạt)`)
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
    })
  }
}
