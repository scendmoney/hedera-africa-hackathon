/**
 * Issuer Studio Envelope Builders
 * Constructs validated HCS message envelopes for issuer workflows
 */

import { SignalMintEnvelope, SignalMintPayload } from './types'

/**
 * Build a SIGNAL_MINT envelope for HCS submission
 * 
 * @param issuerAccountId - Hedera account ID of the issuer (e.g., "0.0.12345")
 * @param payload - Signal mint payload with template and recipient info
 * @returns Validated envelope ready for HCS submission
 */
export function buildSignalMintEnvelope(
  issuerAccountId: string,
  payload: SignalMintPayload
): SignalMintEnvelope {
  // Validate inputs
  if (!issuerAccountId || !issuerAccountId.match(/^0\.0\.\d+$/)) {
    throw new Error('Invalid issuer account ID format (expected 0.0.xxxxx)')
  }
  
  if (!payload.recipientAccountId || !payload.recipientAccountId.match(/^0\.0\.\d+$/)) {
    throw new Error('Invalid recipient account ID format (expected 0.0.xxxxx)')
  }
  
  if (!payload.templateId || payload.templateId.trim().length === 0) {
    throw new Error('Template ID is required')
  }
  
  if (!payload.fill || payload.fill.trim().length === 0) {
    throw new Error('Fill text is required')
  }
  
  // Validate optional fields
  if (payload.note && payload.note.length > 120) {
    throw new Error('Note must be 120 characters or less')
  }
  
  if (payload.evidence && !isValidUrl(payload.evidence)) {
    throw new Error('Evidence must be a valid URL')
  }
  
  // Build envelope
  const nonce = Date.now() // Use timestamp as nonce for MVP simplicity
  const ts = Math.floor(Date.now() / 1000) // Unix timestamp in seconds
  
  return {
    type: 'RECOGNITION_MINT',
    from: issuerAccountId,
    nonce,
    ts,
    payload: {
      t: 'signal.mint@1',
      def_id: `grit.${payload.templateId}@1`,
      to: payload.recipientAccountId,
      fill: payload.fill.trim(),
      ...(payload.note && { note: payload.note.trim() }),
      ...(payload.evidence && { evidence: payload.evidence.trim() })
    }
  }
}

/**
 * Basic URL validation helper
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'ipfs:'
  } catch {
    return false
  }
}

/**
 * Preview envelope as formatted JSON (for debugging/display)
 */
export function previewEnvelope(envelope: SignalMintEnvelope): string {
  return JSON.stringify(envelope, null, 2)
}
