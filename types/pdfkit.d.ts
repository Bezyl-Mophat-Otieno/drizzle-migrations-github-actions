declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number]
    layout?: 'portrait' | 'landscape'
    margin?: number
    margins?: {
      top: number
      bottom: number
      left: number
      right: number
    }
  }

  interface PDFPage {
    width: number
    height: number
  }

  interface ImageOptions {
    fit?: [number, number]
    align?: 'left' | 'center' | 'right'
    valign?: 'top' | 'center' | 'bottom'
    width?: number
    height?: number
  }

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify'
    width?: number
    height?: number
    ellipsis?: boolean | string
    columns?: number
    columnGap?: number
    indent?: number
    paragraphGap?: number
    lineGap?: number
    wordSpacing?: number
    characterSpacing?: number
    fill?: boolean
    stroke?: boolean
    link?: string
    underline?: boolean
    strike?: boolean
    continued?: boolean
    features?: string[]
  }

  class PDFDocument {
    page: PDFPage
    y: number

    constructor(options?: PDFDocumentOptions)

    on(event: 'data', callback: (chunk: Buffer) => void): this
    on(event: 'end', callback: () => void): this
    on(event: 'error', callback: (error: Error) => void): this

    fontSize(size: number): this
    text(text: string, options?: TextOptions): this
    text(text: string, x: number, y: number, options?: TextOptions): this
    
    image(src: Buffer | string, options?: ImageOptions): this
    image(src: Buffer | string, x: number, y: number, options?: ImageOptions): this

    moveDown(lines?: number): this
    addPage(options?: PDFDocumentOptions): this
    end(): void
  }

  export = PDFDocument
}