/**
 * Issuer Studio Types
 * Type definitions for the TrustMesh Issuer Studio MVP
 */

export type IssuerTopic = 'signal' | 'trust' | 'contact' | 'profile'

export type MessageType = 
  | 'RECOGNITION_MINT'  // For SIGNAL_MINT
  | 'TRUST_ALLOCATE' 
  | 'CONTACT_REQUEST' 
  | 'PROFILE_UPDATE'

export interface IssuerFormState {
  topic: IssuerTopic | null
  messageType: MessageType | null
  payload: Record<string, any>
}

// SIGNAL_MINT specific types
export interface SignalMintPayload {
  templateId: string      // Without 'grit.' prefix and '@1' suffix
  recipientAccountId: string
  fill: string
  note?: string
  evidence?: string
}

// Envelope structure (matches existing HCS submission format)
export interface SignalMintEnvelope {
  type: 'RECOGNITION_MINT'
  from: string              // Issuer account ID
  nonce: number             // Monotonic nonce (timestamp for MVP)
  ts: number                // Unix timestamp in seconds
  payload: {
    t: 'signal.mint@1'
    def_id: string          // Full format: 'grit.{templateId}@1'
    to: string              // Recipient account ID
    fill: string            // Template fill text
    note?: string           // Optional note (max 120 chars)
    evidence?: string       // Optional evidence URL/IPFS hash
  }
}

// Event log entry for UI
export interface SubmittedEvent {
  id: string
  timestamp: string
  topic: string
  type: MessageType
  status: 'pending' | 'confirmed' | 'failed'
  sequenceNumber?: string
  consensusTimestamp?: string
  transactionId?: string
  error?: string
}

// API response from submission endpoint
export interface IssuerSubmitResponse {
  success: boolean
  topicId?: string
  sequenceNumber?: string
  consensusTimestamp?: string
  transactionId?: string
  error?: string
}
