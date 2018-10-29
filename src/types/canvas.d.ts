declare module 'canvas' {
  import { Readable as ReadableStream } from 'stream'

  export function createCanvas(width: number, height: number, type?: 'PDF' | 'SVG'): Canvas
  export function createImageData(width: number, height: number): ImageData
  export function createImageData(data: Uint8ClampedArray, width: number, height?: number): ImageData
  export function createImageData(data: Uint16Array, width: number, height?: number): ImageData
  export function loadImage(data: string | Buffer): Promise<Image>
  export function registerFont(path: string, options: { family: string, weight?: string, style?: string }): void

  export class Canvas {
    toBuffer(callback: (err: Error | null, result: Buffer) => void, mimeType?: string, config?: BufferConfig): void
    toBuffer(mimeType?: MimeType, config?: BufferConfig): Buffer

    createPNGStream(config?: PNGConfig): ReadableStream
    createJPEGStream(config?: JPEGConfig): ReadableStream
    createPDFStream(): ReadableStream

    toDataURL(mimeType?: 'image/png'): string
    toDataURL(callback: (err: Error | null, png: string) => void): void
    toDataURL(mimeType: 'image/png', callback: (err: Error | null, png: string) => void): void
    toDataURL(mimeType: 'image/jpeg', callback: (err: Error | null, jpeg: string) => void): void // sync JPEG is not supported
    toDataURL(mimeType: 'image/jpeg', options: JPEGConfig, callback: (err, jpeg) => void): void // see Canvas#createJPEGStream for valid options
    toDataURL(mimeType: 'image/jpeg', quality: number, callback: (err, jpeg) => void): void // spec-following; quality from 0 to 1

    captureStream(frameRate: number): any
    getContext(contextType: '2d'): Context2d
    toBlob(callback: (blob) => void, mimeType: string, qualityArgument: number): void

    height: number
    width: number
    PNG_FILTER_NONE: number
    PNG_FITLER_SUB: number
    PNG_FILTER_UP: number
    PNG_FILTER_AVG: number
    PNG_FILTER_PATETH: number
    PNG_NO_FILTERS: number
    PNG_ALL_FILTERS: number
  }

  export class Image {
    src: Buffer | string
    dataMode: dataMode
    inspect(): string

    clearData()
    onload()
    onerror(err: Error)

    width: number
    height: number
    naturalWidth: number
    naturalHeight: number

    extension(filename: string): string
  }

  enum dataMode {
    DATA_IMAGE = 1,
    DATA_MIME = 2
  }

  enum type {
    UNKNOWN,
    GIF,
    JPEG,
    PNG,
    SVG
  }

  class ImageData {
    width: number
    height: number
    data: Uint8ClampedArray

    constructor (data: Uint8ClampedArray, size: number)
  }

  class Context2d {
    patternQuality: Quality
    quality: Quality
    textDrawingMode: 'path' | 'glyph'
    globalCompositeOperator: CompositeOperator
    antialias: 'default' | 'none' | 'gray' | 'subpixel'

    clearRect(x: number, y: number, width: number, height: number): void
    fillRect(x: number, y: number, width: number, height: number): void
    strokeRect(x: number, y: number, width: number, height: number): void
    drawImage(image: Image | Canvas, dx: number, dy: number, dWidth?: number, dHeight?: number): void
    drawImage(image: Image | Canvas, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number): void
    fillText(text: string, x: number, y: number, maxWidth?: number): void
    strokeText(text: string, x: number, y: number, maxWidth?: number): void
    measureText(text: string): { width: number }
    getLineDash(): number[]
    setLineDash(segments: number[]): void
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient
    createPattern(image: Image, repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat'): CanvasPattern

    beginPath(): void
    closePath(): void
    moveTo(x: number, y: number): void
    lineTo(x: number, y: number): void
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
    rect(x: number, y: number, width: number, height: number): void
    fill(fillRule?: 'nonzero' | 'evenodd'): void
    fill(path: Path2D, fillRule?: 'nonzero' | 'evenodd'): void
    stroke(): void
    stroke(path: Path2D): void
    drawFocusIfNeeded(element: any): void
    drawFocusIfNeeded(path: Path2D, element: any): void
    scrollPathIntoView(path?: Path2D): void
    clip(): void
    clip(path: Path2D): void
    clip(path: Path2D, fillRule: 'nonzero' | 'evenodd'): void
    isPointInPath(x: number, y: number, fillRule?: 'nonzero' | 'evenodd'): boolean
    isPointInPath(path: Path2D, x: number, y: number, fillRule?: 'nonzero' | 'evenodd'): boolean
    isPointInStroke(x: number, y: number): boolean
    isPointInStroke(path: Path2D, x: number, y: number): boolean
    rotate(angle: number): void
    scale(x: number, y: number): void
    translate(x: number, y: number): void
    transform(a: number, b: number, c: number, d: number, e: number, f: number): void
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void
    resetTransform(): void
    createImageData(width: number, height: number): ImageData
    createImageData(imagedata: ImageData): ImageData
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData
    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void
    save(): void
    restore(): void
    addHitRegion(options?: { path?: Path2D, fillRule?: 'nonzero' | 'evenodd', id?: any, parentID?: any, cursor?: string, control?: any, label?: string, role?: any }): void
    removeHitRegion(id: string): void
    clearHitRegions(): void

    lineWidth: number
    lineCap: 'butt' | 'round' | 'square'
    lineJoin: 'bevel' | 'round' | 'miter'
    lineDashOffset: number
    font: string
    textAlign: 'left' | 'right' | 'center' | 'start' | 'end'
    textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom'
    direction: 'ltr' | 'rtl' | 'inherit'
    fillStyle: string | CanvasGradient | CanvasPattern
    strokeStyle: string | CanvasGradient | CanvasPattern
    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number
    currentTransform: any
    globalAlpha: number
    imageSmoothingEnabled: boolean
    imageSmoothingQuality: 'low' | 'medium' | 'high'
    canvas: Canvas
    filter: string
  }

  class CanvasGradient {}
  class CanvasPattern {}
  class Path2D {
    addPath(path: Path2D, transform?: any)
    closePath(): void
    moveTo(x: number, y: number): void
    lineTo(x: number, y: number): void
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void
    rect(x: number, y: number, width: number, height: number): void
    fill(fillRule?: 'nonzero' | 'evenodd'): void
  }

  type MimeType = 'image/png' | 'image/jpeg' | 'raw'

  type JPEGConfig = {
    quality?: number
    progressive?: boolean
    chromaSubsampling?: boolean
  }

  type PNGConfig = {
    compressionLevel?: number
    filters?: number
    palette?: Uint8ClampedArray
    backgroundIndex?: number
    resolution?: number
  }

  type BufferConfig = JPEGConfig | PNGConfig

  type CompositeOperator = 'clear' | 'copy' | 'destination' | 'source-over' | 'destination-over' | 'source-in' | 'destination-in' | 'source-out'
  | 'destination-out' | 'source-atop' | 'destination-atop' | 'xor' | 'lighter' | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken'
  | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color'
  | 'luminosity' | 'saturate'

  type Quality = 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
}
