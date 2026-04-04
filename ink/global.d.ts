/**
 * Global type declarations for Ink components
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ink-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
        flexGrow?: number
        flexShrink?: number
        flexBasis?: number | string
        alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
        alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch'
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
        flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
        width?: number | string
        height?: number | string
        minWidth?: number | string
        minHeight?: number | string
        maxWidth?: number | string
        maxHeight?: number | string
        padding?: number
        paddingX?: number
        paddingY?: number
        paddingTop?: number
        paddingBottom?: number
        paddingLeft?: number
        paddingRight?: number
        margin?: number
        marginX?: number
        marginY?: number
        marginTop?: number
        marginBottom?: number
        marginLeft?: number
        marginRight?: number
        gap?: number
        borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic'
        borderColor?: string
      }
      'ink-text': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        color?: string
        backgroundColor?: string
        bold?: boolean
        italic?: boolean
        underline?: boolean
        strikethrough?: boolean
        inverse?: boolean
        wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end'
        dimColor?: boolean
      }
    }
  }
}

export {}
