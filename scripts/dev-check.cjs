// Test harness dùng chung để tự kiểm tra game bằng Puppeteer trong lúc dev — thay cho việc tạo/xoá script tạm
// + cài/gỡ puppeteer-core mỗi lần cần test (cách làm cũ). `puppeteer-core` giờ là devDependency thật.
//
// Cách dùng:
//   1. Chạy `yarn dev` ở 1 cửa sổ khác (script tự dò cổng đang chạy).
//   2. Sửa phần SCENARIO ở cuối file cho đúng thứ cần test (đây là phần đổi mỗi lần, phần phía trên hầu như
//      không cần đụng vào).
//   3. `node scripts/dev-check.cjs`
//
// `window.__game` chỉ tồn tại ở dev build (xem `src/main.ts`, bọc trong `import.meta.env.DEV` — Vite tự loại
// bỏ hẳn khỏi bundle production) nên script này dùng thẳng được `window.__game.scene...` để đọc/chỉnh state
// scene mà không cần bơm code tạm vào main.ts như trước.

const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-core')

const CHROME_PATH =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const DEV_SERVER_PORTS = [5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180]
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || path.join(__dirname, '../.dev-check-output')

async function findDevServerUrl() {
  for (const port of DEV_SERVER_PORTS) {
    try {
      const res = await fetch(`http://localhost:${port}`)
      if (res.ok) return `http://localhost:${port}`
    } catch {
      // cổng này không có gì đang chạy, thử cổng tiếp theo
    }
  }
  throw new Error(
    `Không tìm thấy dev server đang chạy ở các cổng ${DEV_SERVER_PORTS.join(', ')} — chạy \`yarn dev\` trước.`
  )
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Mở 1 trang Puppeteer trỏ tới dev server, chạy `scenario(page)`, tự đóng browser + in lỗi console/page khi
 * xong (kể cả khi scenario ném lỗi giữa chừng). Đây là hàm chính dùng cho mọi lần test. */
async function withPage(scenario) {
  const url = await findDevServerUrl()
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 960, height: 540 }
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}\n${e.stack}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await sleep(1000)
    await scenario(page)
  } finally {
    console.log('ERRORS:', errors.length ? JSON.stringify(errors, null, 2) : '(không có)')
    await browser.close()
  }
}

/** Chụp ảnh, lưu vào `.dev-check-output/<name>.png` (gitignore, không lẫn vào repo). */
async function screenshot(page, name) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const file = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: file })
  console.log('screenshot:', file)
}

/** Danh sách scene đang active — tiện kiểm tra chuyển scene (Q mở Editor...) có đúng không. */
async function getActiveScenes(page) {
  return page.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.scene.key))
}

module.exports = { withPage, screenshot, getActiveScenes, sleep, SCREENSHOT_DIR }

// ─── SCENARIO — sửa phần này mỗi lần cần test, giữ nguyên phần hạ tầng phía trên ──────────────────────────
if (require.main === module) {
  withPage(async (page) => {
    console.log('active scenes:', await getActiveScenes(page))
    await screenshot(page, '01_initial')
  })
}
