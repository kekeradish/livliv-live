// LivLiv live avatar: the same live page in a transparent, frameless capture window.
// OBS: Window Capture this window with "Allow Transparency" (Windows 10 method) and nothing else to set up.
const { app, BrowserWindow, Tray, Menu, nativeImage, session, screen, dialog, globalShortcut, shell } = require('electron')
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
const AVATARS_DIR = path.join(ROOT, 'avatars')
function openAvatars() {
  try { fs.mkdirSync(AVATARS_DIR, { recursive: true }) } catch {}
  shell.openPath(AVATARS_DIR).catch(() => {})
}
function openCharacters() {
  shell.openPath(path.join(ROOT, 'characters')).catch(() => {})
}
function avatars() {
  const dir = AVATARS_DIR
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

/** something else may hold 5173 (Vite's default port too): only a server that answers like ours may be reused */
async function ourServer() {
  try {
    const r = await fetch(`${BASE}/avatars.json`, { signal: AbortSignal.timeout(1500) })
    const j = await r.json()
    return Array.isArray(j.vrm) && Array.isArray(j.png)
  } catch { return false }
}

const warn = (message, detail) => { dialog.showMessageBox({ type: 'error', title: '形象窗', message, detail, buttons: ['知道了'] }).catch(() => {}) }

/** children that exit at once (no such file, a crash) do not start a server: tell the next candidate */
function trySpawn(bin) {
  return new Promise((resolve) => {
    let child
    try { child = spawn(bin, ['serve.mjs', String(PORT)], { cwd: ROOT, windowsHide: true, stdio: 'ignore' }) } catch { resolve(null); return }
    let settled = false
    const done = (value) => { if (!settled) { settled = true; resolve(value) } }
    child.once('error', () => done(null))
    child.once('exit', () => done(null))
    setTimeout(() => done(child), 1200)   // still running: the port check below decides
  })
}

async function ensureServer() {
  if (await portOpen()) return
  // 'node' may not be on PATH when Node was installed without it; the usual install folders still work
  const local = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'nodejs', 'node.exe') : null
  const bins = [process.env.LIVLIV_NODE, 'node', 'C:\\Program Files\\nodejs\\node.exe', 'D:\\Program Files\\nodejs\\node.exe', local].filter(Boolean)
  for (const bin of bins) {
    const child = await trySpawn(bin)
    if (!child) continue
    for (let i = 0; i < 32; i++) {
      await new Promise((r) => setTimeout(r, 250))
      if (await portOpen()) { serverProc = child; return }
    }
    try { child.kill() } catch {}
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
  // handlers first: the first load may finish (or fail) before a later line would have run
  // drag anywhere on the character; no UI in pet mode (re-applied after every reload)
  let navigations = 0
  win.webContents.on('did-finish-load', () => {
    navigations = 0
    win.webContents.insertCSS('html,body,canvas{-webkit-app-region:drag}')
  })
  // the page comes from the local server: if it went away (or never came up), start it and try again
  win.webContents.on('did-fail-load', (_e, code, _desc, _url, isMainFrame) => {
    if (!isMainFrame || code === -3) return
    if (navigations++ >= 2) {
      warn('形象页没有起来', `页面来自 http://127.0.0.1:${PORT}，本地服务没能启动。\n\n请确认已安装 Node.js，然后右键托盘图标 →「重新加载」。`)
      return
    }
    loadLive()
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.on('close', (e) => {
    if (!quitting) { e.preventDefault(); win.hide() }
  })
  loadLive()
}

function apply(partial, reload = true) {
  Object.assign(settings, partial)
  saveSettings()
  if (reload) loadLive()
  refreshTray()
}

/** the page is served by the local server: bring it back before a reload if it went away */
async function loadLive() {
  if (!win) return
  if (await portOpen()) {
    if (!(await ourServer())) {
      warn(`端口 ${PORT} 被别的程序占用了`, '形象页要用 127.0.0.1:5173，可能被 Vite 之类的开发服务器占了。\n\n关掉占用的程序，然后右键托盘图标 →「重新加载」。')
      return
    }
  } else {
    await ensureServer()
  }
  win.loadURL(liveUrl())
}

/** expressions change at runtime: no reload, so the picture never blinks out and the camera keeps running */
function setExpression(id) {
  apply({ expr: id }, false)
  win?.webContents.executeJavaScript(`window.livliv && window.livliv.expression(${JSON.stringify(id || null)})`).catch(() => {})
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
      { label: '精选角色', submenu: [...chars.map(pick), { type: 'separator' }, { label: '打开精选角色目录…', click: openCharacters }] },
      myItems.length
        ? { label: `我的角色（${myItems.length}）`, submenu: [...myItems.map(pick), { type: 'separator' }, { label: '打开角色目录…', click: openAvatars }] }
        : { label: '我的角色（空）', submenu: [{ label: '打开 avatars 放模型…', click: openAvatars }] },
    ] },
    { label: '打开角色目录（avatars）', click: openAvatars },
    { label: '表情', submenu: [
      { label: '无（跟随我的脸）', type: 'radio', checked: !settings.expr, click: () => setExpression('') },
      ...exprs.map((e) => ({ label: e.label, type: 'radio', checked: settings.expr === e.id, click: () => setExpression(e.id) })),
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
    { label: '重新加载', click: () => { refreshTray(); loadLive() } },   // also picks up a new avatars/ file
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
