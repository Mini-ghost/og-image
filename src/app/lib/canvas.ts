import { resolve } from 'path'
import {
  createCanvas,
  registerFont,
  loadImage,
  Image,
  Canvas
} from 'canvas'

import type { ParsedRequest } from './types'
import { getImageMap, setImageMap } from './cache'
import * as themeConfig from './theme'

type NodeCanvasRenderingContext2D = ReturnType<Canvas['getContext']>
interface BufferGeneraterOptions extends ParsedRequest { }

// 註冊字體
registerFont(resolve('./src/font/Quicksand-Bold.ttf'), { family: 'Quicksand' })
registerFont(resolve('./src/font/jf-openhuninn-1.1.ttf'),{ family: 'Huninn' })

class BufferGenerater {
  static lineHeight: number = 1.333

  private canvas!: Canvas
  private ctx!: NodeCanvasRenderingContext2D

  public width!: number
  public height!: number
  public border!: number

  private theme!: BufferGeneraterOptions['theme']

  public text!: BufferGeneraterOptions['text']
  public fontSize!: BufferGeneraterOptions['fontSize']
  public imageType!: BufferGeneraterOptions['imageType']
  public avatarSize!: BufferGeneraterOptions['avatarSize']

  constructor(options: BufferGeneraterOptions) {

    this.width = options.width
    this.height = options.height
    this.text = options.text
    this.fontSize = options.fontSize
    this.avatarSize = options.avatarSize || this.width * 0.0667
    this.border = this.width * 0.05
    this.theme = options.theme


    this.canvas = createCanvas(this.width, this.height)
    this.ctx = this.canvas.getContext('2d')

  }

  public async genImageBuffer() {

    this.drawBackground()
    await this.drawBackgroundImage()
    await this.drawSignature()
    this.drawTitle()
    
    return  this.imageType === 'jpeg'
      ? this.canvas.toBuffer('image/jpeg')
      : this.canvas.toBuffer('image/png')
  }

  /**
   * 依照空白切分文字段落
   * @param {String} text 文字內容
   * @param {Number} maxWidth 最大寬度
   */
  private getTextLines(
    text: string,
    maxWidth: number = (this.width - this.border * 2) * 0.85
  ): string[] {
    // 參考 https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
    
    const lines: string[] = []
    const words = text.split(' ')

    let current = words[0]

    for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const { width } = this.ctx.measureText(current + ' ' + word)
        if (width < maxWidth) {
            current += ' ' + word
        } else {
            lines.push(current)
            current = word
        }
    }
    lines.push(current)

    return lines
  }

  /**
   * 取得文字區塊的 Y 軸中心位置
   * @param {Number} textAreaHeight 文字區塊高度
   */
  private getTextAreaCenterY(textAreaHeight: number): number {
    const { height, border, avatarSize } = this
    return ((height - border - avatarSize) + textAreaHeight) * 0.5
  }

  /**
   * 主標題
   */
  private drawTitle(): void {
    this.ctx.save()
    this.ctx.beginPath()

    this.ctx.font = `bold ${this.fontSize}px Quicksand, Huninn`
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = themeConfig[this.theme].textColor

    const lines = this.getTextLines(this.text)
    const { length } = lines
    const textHeight = this.fontSize * BufferGenerater.lineHeight
    const conterY = this.getTextAreaCenterY(textHeight * length)
    lines.forEach((text, index) => {
      this.ctx.fillText(
        text, 
        this.border,
        conterY - length * textHeight + index * textHeight
      )
    })

    this.ctx.restore()
  }

  /**
   * 取得圖片（快取或下載）
   * @param {String} url 圖片路徑 
   */
  private async getImage(url: string): Promise<Image> {
    const cacheImage = getImageMap().get(url)
    return !cacheImage
      ? await loadImage(url)
        .then(image => {
          setTimeout(() => { setImageMap(url, image) })
          return image
        })
      : cacheImage
  }

  /**
   * 背景底色
   */
  private drawBackground(): void {
    const { width, height, border } = this
    const helfBorder = border * 0.5
    const themeOptions = themeConfig[this.theme]

    this.ctx.save()
    this.ctx.beginPath()

    this.ctx.fillStyle = themeOptions.backgroundColor
    this.ctx.fillRect(0, 0, width, height)

    this.ctx.fillStyle = themeOptions.subBackgroundColor
    this.ctx.fillRect(helfBorder, helfBorder, width - border, height - border)
  
    this.ctx.restore()
  }

  /**
   * 背景圖片
   */
  private async drawBackgroundImage(): Promise<void> {
    const bgImage = resolve('./src/assets/image/topography.svg')
    await this.getImage(bgImage)
      .then(image => {
        const { width, height, theme } = this

        this.ctx.save()
        this.ctx.beginPath()

        this.ctx.globalAlpha = theme === 'dark' ? 0.66 : 0.25
        this.ctx.fillStyle = this.ctx.createPattern(image, 'repeat')
        this.ctx.fillRect(0, 0, width, height)

        this.ctx.restore()
      })

  }

  /**
   * 簽名
   */
  private async drawSignature(): Promise<void>  {
    const { lineHeight } = BufferGenerater
    const { ctx, height, border, avatarSize, theme } = this


    await this.getImage('https://avatars4.githubusercontent.com/u/39984251?s=60')
      .then(image => {
        // 參考 https://stackoverflow.com/questions/4276048/html5-canvas-fill-circle-with-image
        // 參考 https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip

        const radius = avatarSize * 0.5
        const ImageStartY = height - border - avatarSize
        const centerX = border + radius
        const centerY = ImageStartY + radius
        const PI2 = Math.PI * 2

        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = theme === 'light' ? '#1a91da' : '#ffffff'
        ctx.arc(centerX, centerY, radius + 2.5, 0, PI2)
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, PI2)
        ctx.clip()
        ctx.drawImage(image, border, ImageStartY, avatarSize , avatarSize)
        ctx.restore()
      })

    const size = avatarSize * 0.5
    const subSize = avatarSize * 0.3
    const textStartX = border + avatarSize * 1.25
    const textStartY = height - border - avatarSize - size * 0.3

    ctx.save()
    ctx.beginPath()

    ctx.fillStyle = themeConfig[this.theme].signatureColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'


    ctx.font = `bold ${size}px Quicksand, Huninn`
    ctx.fillText('Alex Liu\'s Blog', textStartX, textStartY)
  
    ctx.font = `bold ${subSize}px Quicksand, Huninn`
    ctx.fillText('mini-ghost.dev', textStartX, textStartY + size * lineHeight)
    ctx.restore()
  }
}


export async function createImageBuffer(
  parsedRequest: ParsedRequest
): Promise<Buffer> {
  const buffer = await new BufferGenerater(parsedRequest).genImageBuffer()
  return buffer
}