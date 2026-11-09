// LivLiv live avatar: the same live page in a transparent, frameless capture window.
// OBS: Window Capture this window with "Allow Transparency" (Windows 10 method) and nothing else to set up.
const { app, BrowserWindow, Tray, Menu, nativeImage, session, screen, dialog, globalShortcut } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const net = require('node:net')
const { spawn } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const PORT = 5173
const BASE = `http://127.0.0.1:${PORT}`
const SETTINGS_FILE = path.join(__dirname, 'settings.json')
const SIZES = { small: [360, 500], medium: [480, 660], large: [640, 880] }
const DEFAULTS = { model: 'd03ft', expr: '', cam: true, mic: true, size: 'medium', alwaysOnTop: false, clickThrough: false }

app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion,IntensiveWakeUpThrottling')

let win = null
let tray = null
let serverProc = null
let quitting = false
let settings = loadSettings()

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) } } catch { return { ...DEFAULTS } }
}
function saveSettings() {
  try { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2)) } catch {}
}
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}
function characters() {
  const list = readJson(path.join(ROOT, 'characters', 'index.json')) || []
  return list.map(({ id, name }) => ({ id, name }))
}
// avatars/: your own .vrm files, and PNGTuber folders (closed/open pictures, optional name.txt)
function avatars() {
  const dir = path.join(ROOT, 'avatars')
  const out = { vrm: [], png: [] }
  let entries = []
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  const slot = (files, s) => files.find((f) => f.replace(/\.[^.]*$/, '').toLowerCase() === s)
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isFile() && /\.vrm$/i.test(e.name)) {
      out.vrm.push({ id: `vrm:${e.name}`, name: e.name.replace(/\.vrm$/i, '') })
      continue
    }
    if (!e.isDirectory() || /^[._]/.test(e.name)) continue
    let files = []
    try { files = fs.readdirSync(path.join(dir, e.name)) } catch { continue }
    if (!slot(files, 'closed') || !slot(files, 'open')) continue
    let name = e.name
    try { name = fs.readFileSync(path.join(dir, e.name, 'name.txt'), 'utf8').trim().slice(0, 60) || name } catch {}
    out.png.push({ id: `png:${e.name}`, name })
  }
  return out
}
// a VRM's expressions are its own file's; the usual five are offered, and one it lacks does nothing
const VRM_EXPRESSIONS = [
  { id: 'happy', label: '开心' }, { id: 'angry', label: '生气' }, { id: 'sad', label: '难过' },
  { id: 'relaxed', label: '放松' }, { id: 'surprised', label: '惊讶' },
]
function expressions(id) {
  if (id.startsWith('vrm:')) return VRM_EXPRESSIONS
  if (id.startsWith('png:')) return []
  const model = readJson(path.join(ROOT, 'characters', id, 'model.json'))
  const list = Array.isArray(model?.expressions) ? model.expressions : []
  return list.map((e) => ({ id: e.id, label: e.label?.zh || e.label?.['zh-CN'] || e.label?.en || e.id }))
}

const portOpen = () => new Promise((resolve) => {
  const s = net.connect({ port: PORT, host: '127.0.0.1' })
  const done = (open) => { s.destroy(); resolve(open) }
  s.once('connect', () => done(true))
  s.once('error', () => done(false))
  s.setTimeout(800, () => done(false))
})

async function ensureServer() {
  if (await portOpen()) return
  const node = [process.env.LIVLIV_NODE, 'node', 'C:\\Program Files\\nodejs\\node.exe', 'D:\\Program Files\\nodejs\\node.exe'].filter(Boolean)
  for (const bin of node) {
    try {
      serverProc = spawn(bin, ['serve.mjs', String(PORT)], { cwd: ROOT, windowsHide: true, stdio: 'ignore' })
      serverProc.on('error', () => { serverProc = null })
      break
    } catch {}
  }
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250))
    if (await portOpen()) return
  }
}

function liveUrl() {
  const p = new URLSearchParams({ bg: 'transparent', mark: '0', pet: '1' })
  if (settings.model.startsWith('vrm:')) p.set('vrm', settings.model.slice(4))
  else if (settings.model.startsWith('png:')) p.set('png', settings.model.slice(4))
  else p.set('model', settings.model)
  if (settings.cam) p.set('cam', '1')
  if (settings.mic) p.set('mic', '1')
  if (settings.expr) p.set('expr', settings.expr)
  return `${BASE}/example/live.html?${p}`
}

function placeWindow() {
  const { width, height } = win.getBounds()
  const area = screen.getPrimaryDisplay().workArea
  win.setPosition(area.x + area.width - width - 40, area.y + area.height - height - 40)
}

function createWindow() {
  const [w, h] = SIZES[settings.size] || SIZES.medium
  win = new BrowserWindow({
    width: w,
    height: h,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: true,
    skipTaskbar: false,
    alwaysOnTop: settings.alwaysOnTop,
    backgroundColor: '#00000000',
    title: 'LivLiv Live·形象窗',
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
  })
  win.setAlwaysOnTop(settings.alwaysOnTop, 'floating')
  win.setIgnoreMouseEvents(settings.clickThrough, { forward: true })
  placeWindow()
  win.loadURL(liveUrl())
  // drag anywhere on the character; no UI in pet mode (re-applied after every reload)
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS('html,body,canvas{-webkit-app-region:drag}')
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.on('close', (e) => {
    if (!quitting) { e.preventDefault(); win.hide() }
  })
}

function apply(partial) {
  Object.assign(settings, partial)
  saveSettings()
  if (win) win.loadURL(liveUrl())
  refreshTray()
}

function refreshTray() {
  if (!tray) return
  const chars = characters()
  const mine = avatars()
  const myItems = [...mine.vrm, ...mine.png]
  const pick = (c) => ({
    label: c.name, type: 'radio', checked: c.id === settings.model,
    click: () => apply({ model: c.id, expr: '' }),
  })
  const exprs = expressions(settings.model)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '显示 / 隐藏', click: () => (win.isVisible() ? win.hide() : win.show()) },
    { type: 'separator' },
    { label: '角色', submenu: [
      { label: '精选角色', submenu: chars.map(pick) },
      ...(myItems.length ? [{ label: '我的角色', submenu: myItems.map(pick) }] : []),
    ] },
    { label: '表情', submenu: [
      { label: '无（跟随我的脸）', type: 'radio', checked: !settings.expr, click: () => apply({ expr: '' }) },
      ...exprs.map((e) => ({ label: e.label, type: 'radio', checked: settings.expr === e.id, click: () => apply({ expr: e.id }) })),
    ] },
    { label: '动作', submenu: [
      ['nod', '点头'], ['shake', '摇头'], ['tilt', '歪头'], ['hop', '跳一下'], ['shy', '害羞'],
    ].map(([id, label]) => ({
      label,
      click: () => win?.webContents.executeJavaScript(`window.livliv && window.livliv.act(${JSON.stringify(id)})`).catch(() => {}),
    })) },
    { type: 'separator' },
    { label: '摄像头 · 面部追踪', type: 'checkbox', checked: settings.cam, click: (i) => apply({ cam: i.checked }) },
    { label: '麦克风 · 嘴型同步', type: 'checkbox', checked: settings.mic, click: (i) => apply({ mic: i.checked }) },
    { type: 'separator' },
    { label: '鼠标穿透（点不到它）', type: 'checkbox', checked: settings.clickThrough, click: (i) => {
      settings.clickThrough = i.checked; saveSettings(); win.setIgnoreMouseEvents(i.checked, { forward: true }); refreshTray()
    } },
    { label: '总在最前', type: 'checkbox', checked: settings.alwaysOnTop, click: (i) => {
      settings.alwaysOnTop = i.checked; saveSettings(); win.setAlwaysOnTop(i.checked, 'floating'); refreshTray()
    } },
    { label: '大小', submenu: [['small', '小'], ['medium', '中'], ['large', '大']].map(([v, l]) => ({
      label: l, type: 'radio', checked: settings.size === v,
      click: () => { settings.size = v; saveSettings(); win.setSize(...SIZES[v]); refreshTray() },
    })) },
    { type: 'separator' },
    { label: 'OBS 怎么采（透明）', click: () => dialog.showMessageBox({
      type: 'info',
      title: 'OBS 采集这个形象窗',
      message: 'OBS → 来源 + → 窗口采集',
      detail: '窗口选「LivLiv Live · 角色名」（electron.exe）\n采集方式选「Windows 10 (1903 及以上)」\n勾上「允许透明度」（Allow Transparency）\n右键来源 → 变换 → 适应屏幕\n\n这样就是真透明叠加，不用绿幕、不用裁剪。\n如果找不到「允许透明度」，改用「显示器采集」也能看到它。',
      buttons: ['知道了'],
    }) },
    { label: '重新加载', click: () => win.loadURL(liveUrl()) },
    { label: '退出', click: () => { quitting = true; app.quit() } },
  ]))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => { win?.show(); win?.focus() })

  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(permission === 'media'))
    session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'media')
    await ensureServer()
    createWindow()
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon.png')))
    tray.setToolTip('LivLiv 直播形象')
    tray.on('click', () => (win.isVisible() ? win.hide() : win.show()))
    refreshTray()
    globalShortcut.register('CommandOrControl+Alt+Q', () => { quitting = true; app.quit() })
  })

  app.on('window-all-closed', (e) => e.preventDefault())
  app.on('will-quit', () => { if (serverProc) { try { serverProc.kill() } catch {} } })
}
