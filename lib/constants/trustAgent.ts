/**
 * Trust Agent - The "Tom from MySpace" of Web3
 * 
 * A special system account that every new user is automatically bonded to.
 * Provides onboarding guidance, network health checks, and system announcements.
 */

export const TRUST_AGENT = {
  // Hedera Account ID (dedicated testnet account for Trust Agent)
  hederaAccountId: '0.0.5000001', // TODO: Replace with real provisioned account
  
  // DID (derived from EVM address)
  did: 'did:ethr:0xTRUSTAGENT', // TODO: Replace with real DID
  
  // Profile metadata
  handle: 'TrustAgent',
  displayName: 'Trust Agent',
  bio: 'Your guide to building authentic connections in TrustMesh. I help you discover people and events IRL, send recognition signals, and grow your trust network. 🔥',
  
  // Visual identity
  avatar: '🔥', // Purple flame emoji
  color: '#ec4899', // Magenta/purple
  
  // Special flags
  isSystem: true,
  isVerified: true,
  isTrustAgent: true,
} as const

/**
 * Check if an account ID is the Trust Agent
 */
export function isTrustAgent(accountId: string | null | undefined): boolean {
  if (!accountId) return false
  return accountId === TRUST_AGENT.hederaAccountId
}

/**
 * Check if a DID is the Trust Agent
 */
export function isTrustAgentDid(did: string | null | undefined): boolean {
  if (!did) return false
  return did === TRUST_AGENT.did
}
