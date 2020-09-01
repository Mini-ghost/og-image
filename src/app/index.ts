import type { IncomingMessage, ServerResponse } from 'http';
import { reqParser } from './lib/parser'
import { createImageBuffer } from './lib/canvas'
import { getBufferMap, setBufferMap } from './lib/cache'


export default async function createImage(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const parsed = reqParser(req.url)
    const cacheKey = JSON.stringify(parsed)

    const cacheBuffer = getBufferMap().get(cacheKey)
    const buffer = !cacheBuffer
      ? await createImageBuffer(parsed)
        .then(buffer => {
      
          setImmediate(() => { setBufferMap(cacheKey, buffer) })
          return buffer
        })
      : cacheBuffer
  
    res.statusCode = 200
    res.setHeader('Content-Type', `image/${parsed.imageType}`)
    res.setHeader(
      'Cache-Control',
      'public, immutable, no-transform, s-maxage=31536000, max-age=31536000'
    )

    res.end(buffer)
  
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>')
    console.error(error)
  }
}

