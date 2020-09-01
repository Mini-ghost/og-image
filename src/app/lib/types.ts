type ImageType = 'png' | 'jpeg'
type Theme = 'light' | 'dark'

export interface ParsedRequest {
  /** 
   * 色彩模式 
   */
  theme: Theme;
  /**
   * 圖片寬
   */
  width: number;
  /**
   * 圖片高度
   */
  height: number;
  /**
   * 圖檔副檔名
   */
  imageType: ImageType;
  /**
   * 標題文字內容
   */
  text: string;
  /**
   * 內文字題大小
   */
  fontSize: number;
  /**
   * 頭像大小
   */
  avatarSize: number
}