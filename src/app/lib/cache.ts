import type { Image } from 'canvas'

let imageMap: Map<string, Image> | undefined = undefined
let bufferMap: Map<string, Buffer> | undefined = undefined

/**
 * 取得 image 快取
 */
export const getImageMap = () => {
  if (!imageMap) { imageMap = new Map() }
  return imageMap
}

/**
 * 設定 image 快取
 * @param {string} key 
 * @param {Image} image 
 */
export const setImageMap = (
  key: string,
  image: Image
) => {
  if (!imageMap) {
    imageMap = new Map([[key, image]])
    return
  }
  imageMap.set(key, image)
}


/**
 * 取得 buffer 快取
 */
export const getBufferMap = () => {
  if (!bufferMap) { bufferMap = new Map() }
  return bufferMap
}

/**
 * 設定 buffer 快取
 * @param {string} key 
 * @param {Buffer} buffer 
 */
export const setBufferMap = (
  key: string,
  buffer: Buffer
) => {
  if (!bufferMap) {
    bufferMap = new Map([[key, buffer]])
    return
  }
  
  // 快取 10 張圖片
  if (bufferMap.size >= 10) {
    const iterator = bufferMap.keys() 
    bufferMap.delete(iterator.next().value)
  }

  bufferMap.set(key, buffer)
}