// Zero-dependency static server for the LivLiv Player examples.
// Run: node serve.mjs [port]   (default 5173, binds 127.0.0.1)
// Then open http://127.0.0.1:5173/example/demo.html
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.argv[2] || process.env.PORT || 5173)
const host = '127.0.0.1'

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
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
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
function avatars() {
  const dir = path.join(root, 'avatars')
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

const server = http.createServer((req, res) => {
  let urlPath
  try { urlPath = decodeURIComponent(new URL(req.url, `http://${host}`).pathname) }
  catch { res.writeHead(400).end('Bad request'); return }

  if (urlPath === '/') { res.writeHead(302, { Location: '/example/demo.html' }).end(); return }

  if (urlPath === '/avatars.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' })
    res.end(JSON.stringify(avatars()))
    return
  }

  const filePath = path.normalize(path.join(root, urlPath))
  if (filePath !== root && !filePath.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return }

  fs.stat(filePath, (err, stat) => {
    let target = filePath
    if (!err && stat.isDirectory()) {
      target = path.join(filePath, 'index.html')
      if (!fs.existsSync(target)) { res.writeHead(404).end('Not found'); return }
    } else if (err) { res.writeHead(404).end('Not found'); return }

    const ext = path.extname(target).toLowerCase()
    const type = MIME[ext] || 'application/octet-stream'
    const stream = fs.createReadStream(target)
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
    stream.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end() })
    stream.pipe(res)
  })
})

server.on('error', (e) => { console.error(`Server error: ${e.message}`); process.exit(1) })
server.listen(port, host, () => {
  console.log(`LivLiv Player running at http://${host}:${port}/`)
  console.log(`  Demo:    http://${host}:${port}/example/demo.html`)
  console.log(`  Gallery: http://${host}:${port}/example/gallery.html`)
  console.log(`Serving: ${root}`)
})