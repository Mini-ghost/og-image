import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createApp, createRouter, eventHandler, getQuery, getRouterParams, toNodeListener } from 'h3'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ONE_YEAR = 60 * 60 * 24 * 365
const template = readFileSync(resolve(__dirname, './assets/template.svg'), 'utf-8')
function format(date: number | Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

const app = createApp()
const router = createRouter()

router.get('/favicon.ico', eventHandler(({ node }) => {
  node.res.statusCode = 204
  node.res.setHeader('Content-Type', 'image/x-icon')
}))

const cache = new Map<string, string>()

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
    const data: Record<string, string> = {
      title: title.map((t, index) => `<tspan x="73" y="${255 + index * 70}">${t}</tspan>`).join(''),
      meta: `<tspan x="73" y="${300 + (title.length - 1) * 70}">${meta}</tspan>`,
    }

    const svg = template.replace(/\{\{([^}]+)}}/g, (_, name) => data[name] || '')
    // const image = sharp(Buffer.from(svg)).resize(1200 * 1.1, 630 * 1.1)

    cache.set(key, svg)
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'image/svg+xml')
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
