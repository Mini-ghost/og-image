import { IncomingMessage } from 'http'
import { parse } from 'url'
import type { ParsedRequest } from './types'

export function reqParser(url: IncomingMessage['url']): ParsedRequest {
  const { pathname, query } = parse(url || '/', true)
  const {
    fontSize,
    width,
    height,
    theme,
    avatarSize
  } = (query || {})
  const { extension, fileName } = fileParser(pathname || '/')
  if (
      Array.isArray(fontSize) ||
      Array.isArray(width) ||
      Array.isArray(height) ||
      Array.isArray(theme) ||
      Array.isArray(avatarSize)
  ) {
    throw 'error'
  }

  const parsed: ParsedRequest = {
    theme: theme === 'light' ? 'light' : 'dark',
    imageType: extension === 'jpeg' ? extension : 'png',
    text: decodeURIComponent(fileName) || '${ Not Fond fileName }',
    width: Number(width) || 1200,
    height: Number(height) || 675,
    fontSize: Number(fontSize) || 52,
    avatarSize: Number(avatarSize)
  }

  parsed.avatarSize || Math.max(parsed.avatarSize = parsed.width * 0.05, 60)

  return parsed
}

/**
 * 解析檔名與副檔名
 * @param {String} pathname - 傳入 pathname
 */
function fileParser(pathname: string) {
  
  const arr = pathname.slice(1).split('.')

  let extension = ''
  let fileName = ''

  if (arr.length === 0) {
    fileName = '';
  } else if (arr.length === 1) {
    fileName = arr[0];
  } else {
    extension = arr.pop() as string;
    fileName = arr.join('.');
  }

  return {
    extension,
    fileName
  }
}