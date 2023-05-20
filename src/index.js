'use strict'
const __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P((resolve) => { resolve(value) }) }
  return new (P || (P = Promise))((resolve, reject) => {
    function fulfilled(value) { try { step(generator.next(value)) } catch (e) { reject(e) } }
    function rejected(value) { try { step(generator.throw(value)) } catch (e) { reject(e) } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected) }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}
const __generator = (this && this.__generator) || function(thisArg, body) {
  let _ = { label: 0, sent() { if (t[0] & 1) throw t[1]; return t[1] }, trys: [], ops: [] }; let f; let y; let t; let g
  return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === 'function' && (g[Symbol.iterator] = function() { return this }), g
  function verb(n) { return function(v) { return step([n, v]) } }
  function step(op) {
    if (f) throw new TypeError('Generator is already executing.')
    while (g && (g = 0, op[0] && (_ = 0)), _) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t
        if (y = 0, t) op = [op[0] & 2, t.value]
        switch (op[0]) {
          case 0: case 1: t = op; break
          case 4: _.label++; return { value: op[1], done: false }
          case 5: _.label++; y = op[1]; op = [0]; continue
          case 7: op = _.ops.pop(); _.trys.pop(); continue
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break }
            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break }
            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break }
            if (t[2]) _.ops.pop()
            _.trys.pop(); continue
        }
        op = body.call(thisArg, _)
      } catch (e) { op = [6, e]; y = 0 } finally { f = t = 0 }
    }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true }
  }
}
Object.defineProperty(exports, '__esModule', { value: true })
const node_http_1 = require('node:http')
const node_path_1 = require('node:path')
const node_url_1 = require('node:url')
const h3_1 = require('h3')
const canvas_1 = require('canvas')
const __filename = (0, node_url_1.fileURLToPath)(import.meta.url)
const __dirname = (0, node_path_1.dirname)(__filename);
(0, canvas_1.registerFont)((0, node_path_1.resolve)(__dirname, './assets/fonts/Noto_Sans_TC/NotoSansTC-Bold.otf'), { family: 'Noto Sans TC', weight: 'bold' });
(0, canvas_1.registerFont)((0, node_path_1.resolve)(__dirname, './assets/fonts/Inter/Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' })
const ONE_YEAR = 60 * 60 * 24 * 365
function format(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
const app = (0, h3_1.createApp)()
const router = (0, h3_1.createRouter)()
router.get('/favicon.ico', (0, h3_1.eventHandler)((_a) => {
  const node = _a.node
  node.res.statusCode = 204
  node.res.setHeader('Content-Type', 'image/x-icon')
}))
const cache = new Map()
router.get('/:title', (0, h3_1.eventHandler)((event) => {
  return __awaiter(void 0, void 0, void 0, function() {
    let res, _title, _a, create, read, title, meta, key, canvas, ctx_1, _b, _c, _d
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          res = event.node.res
          _title = (0, h3_1.getRouterParams)(event).title
          _a = (0, h3_1.getQuery)(event), create = _a.create, read = _a.read
          title = decodeURIComponent(_title).trim().split(/(.{0,32})(?:\s|$)/g).filter(Boolean)
          create = Array.isArray(create) ? create[0] : create
          create = format(Number(create))
          read = Array.isArray(read) ? read[0] : read
          meta = ''.concat(create, ' \u2022 ').concat(read)
          key = JSON.stringify({ title, meta })
          if (cache.has(key)) return [3 /* break */, 2]
          canvas = (0, canvas_1.createCanvas)(1200, 630)
          ctx_1 = canvas.getContext('2d')
          ctx_1.fillStyle = '#121212'
          ctx_1.fillRect(0, 0, 1200, 630)
          _b = ctx_1
          _d = (_c = ctx_1).createPattern
          return [4 /* yield */, (0, canvas_1.loadImage)((0, node_path_1.resolve)(__dirname, './assets/template.svg'))]
        case 1:
          _b.fillStyle = _d.apply(_c, [_e.sent(), 'repeat'])
          ctx_1.fillRect(0, 0, 1200, 630)
          ctx_1.font = "bold 48px Inter, 'Noto Sans TC'"
          ctx_1.fillStyle = '#F3F3F3'
          title.forEach((text, index) => { return ctx_1.fillText(text, 73, 255 + index * 70) })
          ctx_1.font = "bold 24px Inter, 'Noto Sans TC'"
          ctx_1.fillStyle = '#838383'
          ctx_1.fillText(meta, 73, 300 + (title.length - 1) * 70)
          cache.set(key, canvas.toBuffer())
          _e.label = 2
        case 2:
          res.statusCode = 200
          res.setHeader('Content-Type', 'image/png')
          res.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage='.concat(ONE_YEAR, ', max-age=').concat(ONE_YEAR))
          res.end(cache.get(key))
          return [2]
      }
    })
  })
}))
app.use(router);
(0, node_http_1.createServer)((0, h3_1.toNodeListener)(app)).listen(process.env.PORT || 3300)
process.on('SIGINT', () => {
  process.exit(0)
})
