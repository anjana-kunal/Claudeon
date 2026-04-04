/**
 * Color Diff NAPI stub
 * Native module for color difference calculations
 */

export interface ColorDiffResult {
  deltaE: number
  diff: number
}

export interface SyntaxTheme {
  name: string
  colors: Record<string, string>
}

export function colorDiff(_color1: string, _color2: string): ColorDiffResult {
  return { deltaE: 0, diff: 0 }
}

export function closestColor(_target: string, _palette: string[]): string {
  return _palette[0] ?? '#000000'
}

export class ColorDiff {
  constructor(
    private patch?: unknown,
    private firstLine?: string,
    private filePath?: string,
    private fileContent?: string
  ) {}
  
  render(_theme: string, _width: number, _dim?: boolean): string[] | null {
    // Return empty diff lines - syntax highlighting disabled in stub
    return []
  }
  
  diff(_content: string): string {
    return _content
  }
}

export class ColorFile {
  constructor(private path: string, private content?: string) {}
  
  render(_theme: string, _width: number, _dim?: boolean): string[] {
    // Return the content as plain lines without highlighting
    return (this.content || '').split('\n')
  }
  
  getContent(): string {
    return this.content || ''
  }
  
  getHighlighted(): string {
    return this.content || ''
  }
}

export function getSyntaxTheme(_name?: string): SyntaxTheme {
  return {
    name: 'default',
    colors: {},
  }
}

