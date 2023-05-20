import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp, createRouter, eventHandler, getQuery, getRouterParams, toNodeListener } from 'h3'
import {
  createCanvas,
  loadImage,
  registerFont,
} from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

registerFont(resolve(__dirname, './assets/fonts/Noto_Sans_TC/NotoSansTC-Bold.otf'), { family: 'Noto Sans TC', weight: 'bold' })
registerFont(resolve(__dirname, './assets/fonts/Inter/Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' })

const ONE_YEAR = 60 * 60 * 24 * 365

function format(date: number | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const app = createApp()
const router = createRouter()

router.get('/favicon.ico', eventHandler(({ node }) => {
  node.res.statusCode = 204
  node.res.setHeader('Content-Type', 'image/x-icon')
}))

const cache = new Map<string, Buffer>()

router.get('/:title', eventHandler(async(event) => {
  const { res } = event.node

  const { title: _title } = getRouterParams(event)
  let { create, read } = getQuery(event) as Record<string, string | string[]>

  const title = decodeURIComponent(_title).trim().split(/(.{0,32})(?:\s|$)/g).filter(Boolean)

  create = Array.isArray(create) ? create[0] : create
  create = format(Number(create))

  read = Array.isArray(read) ? read[0] : read

  const meta = `${create} • ${read}`

  const key = JSON.stringify({ title, meta })

  if (!cache.has(key)) {
    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, 1200, 630)
    ctx.fillStyle = ctx.createPattern(await loadImage(resolve(__dirname, './assets/template.svg')), 'repeat')
    ctx.fillRect(0, 0, 1200, 630)

    ctx.font = "bold 48px Inter, 'Noto Sans TC'"
    ctx.fillStyle = '#F3F3F3'
    title.forEach((text, index) => ctx.fillText(text, 73, 255 + index * 70))

    ctx.font = "bold 24px Inter, 'Noto Sans TC'"
    ctx.fillStyle = '#838383'
    ctx.fillText(meta, 73, 300 + (title.length - 1) * 70)

    cache.set(key, canvas.toBuffer())
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'image/png')
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=${ONE_YEAR}, max-age=${ONE_YEAR}`,
  )

  res.end(cache.get(key))
}))

app.use(router)

createServer(toNodeListener(app)).listen(process.env.PORT || 3300)

process.on('SIGINT', () => {
  process.exit(0)
})
