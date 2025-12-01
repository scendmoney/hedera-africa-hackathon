import { NextRequest, NextResponse } from 'next/server'
import { submitToTopic } from '@/lib/hedera/serverClient'
import { getRegistryTopics } from '@/lib/hcs2/registry'
import { IssuerSubmitResponse } from '@/lib/issuer/types'

/**
 * Issuer Studio HCS Submission Endpoint
 * 
 * Accepts validated envelopes from the Issuer Studio UI and submits them to HCS.
 * Wraps the core HCS submission logic with issuer-specific validation and logging.
 */
export async function POST(req: NextRequest): Promise<NextResponse<IssuerSubmitResponse>> {
  try {
    const envelope = await req.json()
    
    // Basic envelope validation
    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Invalid envelope: must be a JSON object')
    }
    
    if (!envelope.type) {
      throw new Error('Invalid envelope: missing type field')
    }
    
    if (!envelope.from) {
      throw new Error('Invalid envelope: missing from field')
    }
    
    // Log submission attempt (can be extended with auth later)
    console.log('[Issuer Studio] Submitting envelope:', {
      type: envelope.type,
      from: envelope.from,
      timestamp: new Date().toISOString()
    })
    
    // Get topic registry
    const topics = await getRegistryTopics()
    
    // Route to appropriate topic based on message type
    let topicId: string
    
    switch (envelope.type) {
      case 'RECOGNITION_MINT':
        // Prefer recognitionInstances if available, fall back to recognition
        topicId = topics.recognitionInstances || topics.recognition
        if (!topicId) {
          throw new Error('Recognition topic not configured in registry')
        }
        break
        
      case 'TRUST_ALLOCATE':
      case 'TRUST_REVOKE':
        topicId = topics.trust
        if (!topicId) {
          throw new Error('Trust topic not configured in registry')
        }
        break
        
      case 'CONTACT_REQUEST':
      case 'CONTACT_ACCEPT':
        topicId = topics.contacts
        if (!topicId) {
          throw new Error('Contact topic not configured in registry')
        }
        break
        
      case 'PROFILE_UPDATE':
        topicId = topics.profile
        if (!topicId) {
          throw new Error('Profile topic not configured in registry')
        }
        break
        
      default:
        throw new Error(`Unsupported message type: ${envelope.type}`)
    }
    
    // Serialize envelope to JSON string
    const message = JSON.stringify(envelope)
    
    // Submit to Hedera via server client
    const result = await submitToTopic(topicId, message)
    
    // Log success
    console.log('[Issuer Studio] Submission successful:', {
      type: envelope.type,
      topicId,
      sequenceNumber: result.sequenceNumber,
      timestamp: new Date().toISOString()
    })
    
    // Return detailed response
    return NextResponse.json({
      success: true,
      topicId,
      sequenceNumber: result.sequenceNumber?.toString(),
      consensusTimestamp: result.consensusTimestamp,
      transactionId: result.transactionId
    })
    
  } catch (error: any) {
    // Log error
    console.error('[Issuer Studio] Submission failed:', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Submission failed'
      },
      { status: 400 }
    )
  }
}
