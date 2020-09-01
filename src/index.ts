import http from 'http'
import createImage from './app'

const PORT = 3300
const server = http
  .createServer((req, res) => {
    if (req.url === '/favicon.ico') {
      // control for favicon
      res.writeHead(204, { 'Content-Type': 'image/x-icon' })
      res.end()
      return
    }
    createImage(req, res)
  })
  .listen(PORT, () => {
    console.log(`success listen as http://localhost:${PORT}`)
  })