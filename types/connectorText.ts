/**
 * Connector Text types - Stub
 */

export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
  connectorId?: string
}

export function isConnectorTextBlock(block: unknown): block is ConnectorTextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as ConnectorTextBlock).type === 'connector_text'
  )
}

export function createConnectorTextBlock(text: string, connectorId?: string): ConnectorTextBlock {
  return {
    type: 'connector_text',
    text,
    connectorId,
  }
}
