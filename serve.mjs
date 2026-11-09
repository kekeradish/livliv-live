// Zero-dependency static server for the LivLiv Player examples.
// Run: node serve.mjs [port]   (default 5173, binds 127.0.0.1)
// Then open http://127.0.0.1:5173/example/demo.html
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { startServer } = require('./desktop/server.js')

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.argv[2] || process.env.PORT || 5173)
const host = '127.0.0.1'

startServer({ root, avatarsDir: path.join(root, 'avatars'), port, host })
  .then(() => {
    console.log(`LivLiv Player running at http://${host}:${port}/`)
    console.log(`  Demo:    http://${host}:${port}/example/demo.html`)
    console.log(`  Gallery: http://${host}:${port}/example/gallery.html`)
    console.log(`Serving: ${root}`)
  })
  .catch((e) => { console.error(`Server error: ${e.message}`); process.exit(1) })