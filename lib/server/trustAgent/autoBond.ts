/**
 * Trust Agent Auto-Bonding
 * 
 * Automatically creates a bond between new users and the Trust Agent
 * on their first login. This is the "Tom from MySpace" experience
 * where everyone starts with at least one friend.
 */

import { TRUST_AGENT } from '@/lib/constants/trustAgent'
import { signalsStore } from '@/lib/stores/signalsStore'

/**
 * Auto-bond a new user to Trust Agent
 * 
 * Creates a CONTACT_ADD event in the signals store so Trust Agent
 * appears in the user's contacts immediately.
 * 
 * @param userAccountId - The new user's Hedera account ID
 * @param userDid - The new user's DID
 * @returns true if bond was created, false if already exists
 */
export async function autoBondToTrustAgent(
  userAccountId: string,
  userDid: string
): Promise<boolean> {
  try {
    console.log(`[TrustAgent] Auto-bonding user ${userAccountId} to Trust Agent`)
    
    // Check if user already bonded to Trust Agent
    const existingContacts = signalsStore.getBondedContacts(userAccountId)
    const alreadyBonded = existingContacts.some(
      contact => contact.peerId === TRUST_AGENT.hederaAccountId
    )
    
    if (alreadyBonded) {
      console.log(`[TrustAgent] User ${userAccountId} already bonded to Trust Agent`)
      return false
    }
    
    // Create CONTACT_ADD event (bidirectional)
    const bondEvent = {
      type: 'CONTACT_ADD' as const,
      actor: userAccountId,
      target: TRUST_AGENT.hederaAccountId,
      metadata: {
        handle: TRUST_AGENT.handle,
        isAutomatic: true,
        reason: 'trust_agent_auto_bond'
      },
      timestamp: new Date().toISOString()
    }
    
    // Add to signals store (in-memory for now)
    // TODO: Also publish to HCS topic for durability
    signalsStore.addEvent(bondEvent)
    
    console.log(`[TrustAgent] Successfully auto-bonded ${userAccountId} to Trust Agent`)
    
    return true
  } catch (error) {
    console.error(`[TrustAgent] Failed to auto-bond user ${userAccountId}:`, error)
    return false
  }
}

/**
 * Check if user should be auto-bonded to Trust Agent
 * 
 * @param userAccountId - The user's Hedera account ID
 * @returns true if user needs auto-bonding
 */
export async function shouldAutoBond(userAccountId: string): Promise<boolean> {
  // Check if user has any contacts
  const contacts = signalsStore.getBondedContacts(userAccountId)
  
  // If user has no contacts, they need Trust Agent
  if (contacts.length === 0) {
    return true
  }
  
  // If user has contacts but not Trust Agent, still bond
  const hasTrustAgent = contacts.some(
    contact => contact.peerId === TRUST_AGENT.hederaAccountId
  )
  
  return !hasTrustAgent
}
