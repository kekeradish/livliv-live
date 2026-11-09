// The local static server the live page comes from: run inside Electron (packaged app) or by `node serve.mjs`.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.livliv': 'application/octet-stream',
  '.zip': 'application/octet-stream',
  '.vrm': 'application/octet-stream',
  '.glb': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
}

// the characters in avatars/: a .vrm file, or a folder of PNGTuber pictures (closed, open, blink, blink-open, name.txt)
function avatars(dir) {
  const out = { vrm: [], png: [] }
  let entries = []
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  const IMG = /\.(png|jpe?g|webp|gif|avif)$/i
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isFile() && /\.vrm$/i.test(e.name)) {
      out.vrm.push({ id: e.name, name: e.name.replace(/\.vrm$/i, '') })
      continue
    }
    if (!e.isDirectory() || /^[._]/.test(e.name)) continue
    let files = []
    try { files = fs.readdirSync(path.join(dir, e.name)) } catch { continue }
    const imgs = files.filter((f) => IMG.test(f) && !f.startsWith('.'))
    const slot = (s) => imgs.find((f) => f.replace(/\.[^.]*$/, '').toLowerCase() === s)
    if (!slot('closed') || !slot('open')) continue
    let name = e.name
    try { name = fs.readFileSync(path.join(dir, e.name, 'name.txt'), 'utf8').trim().slice(0, 60) || name } catch {}
    out.png.push({ id: e.name, name, files: [...['closed', 'open', 'blink', 'blink-open'].map(slot).filter(Boolean), ...(files.includes('name.txt') ? ['name.txt'] : [])] })
  }
  return out
}

/** Serves `root` on 127.0.0.1:port; `avatarsDir` is where /avatars and /avatars.json come from (the user's own folder). */
function startServer({ root, avatarsDir, port = 5173, host = '127.0.0.1' }) {
  const server = http.createServer((req, res) => {
    let urlPath
    try { urlPath = decodeURIComponent(new URL(req.url, `http://${host}`).pathname) }
    catch { res.writeHead(400).end('Bad request'); return }

    if (urlPath === '/') { res.writeHead(302, { Location: '/example/demo.html' }).end(); return }

    const avatarBase = avatarsDir || path.join(root, 'avatars')
    if (urlPath === '/avatars.json') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' })
      res.end(JSON.stringify(avatars(avatarBase)))
      return
    }
    // the user's own characters live outside root (a writable folder); the rest is the app's own files
    const filePath = path.normalize(urlPath.startsWith('/avatars/') ? path.join(avatarBase, urlPath.slice(9)) : path.join(root, urlPath))
    if (!filePath.startsWith(path.normalize(avatarBase) + path.sep) && !filePath.startsWith(path.normalize(root) + path.sep)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    fs.stat(filePath, (err, stat) => {
      let target = filePath
      if (!err && stat.isDirectory()) {
        target = path.join(filePath, 'index.html')
        if (!fs.existsSync(target)) { res.writeHead(404).end('Not found'); return }
      } else if (err) { res.writeHead(404).end('Not found'); return }

      const type = MIME[path.extname(target).toLowerCase()] || 'application/octet-stream'
      const stream = fs.createReadStream(target)
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
      stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end() })
      stream.pipe(res)
    })
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => resolve(server))
  })
}

module.exports = { startServer }
