/**
 * TrustMesh Issuer Studio MVP
 * 
 * Admin interface for creating and submitting structured HCS messages directly to topics.
 * MVP focuses on SIGNAL_MINT (recognition) messages with a simple form + event log UI.
 */

'use client'

import { useState } from 'react'
import { ulid } from 'ulid'
import { SignalMintForm } from '@/components/issuer/SignalMintForm'
import { EventLog } from '@/components/issuer/EventLog'
import { buildSignalMintEnvelope } from '@/lib/issuer/envelopeBuilder'
import { 
  SubmittedEvent, 
  SignalMintPayload, 
  IssuerSubmitResponse 
} from '@/lib/issuer/types'

// Hardcoded issuer account for MVP (can be made configurable later)
const ISSUER_ACCOUNT_ID = process.env.NEXT_PUBLIC_ISSUER_ACCOUNT_ID || '0.0.4851773'

export default function IssuerStudioPage() {
  const [events, setEvents] = useState<SubmittedEvent[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (payload: SignalMintPayload) => {
    setIsSubmitting(true)
    
    const tempId = ulid()
    
    // Add pending event to log immediately
    const pendingEvent: SubmittedEvent = {
      id: tempId,
      timestamp: new Date().toISOString(),
      topic: 'signal',
      type: 'RECOGNITION_MINT',
      status: 'pending'
    }
    
    setEvents(prev => [pendingEvent, ...prev])
    
    try {
      // Build envelope using envelope builder
      const envelope = buildSignalMintEnvelope(ISSUER_ACCOUNT_ID, payload)
      
      // Submit to HCS via issuer API endpoint
      const response = await fetch('/api/issuer/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(envelope)
      })
      
      const result: IssuerSubmitResponse = await response.json()
      
      if (result.success) {
        // Update event with confirmed status
        setEvents(prev => prev.map(e => 
          e.id === tempId 
            ? {
                ...e,
                status: 'confirmed',
                sequenceNumber: result.sequenceNumber,
                consensusTimestamp: result.consensusTimestamp,
                transactionId: result.transactionId
              }
            : e
        ))
      } else {
        throw new Error(result.error || 'Submission failed')
      }
      
    } catch (error: any) {
      console.error('Submission error:', error)
      
      // Update event with failed status
      setEvents(prev => prev.map(e => 
        e.id === tempId 
          ? {
              ...e,
              status: 'failed',
              error: error.message || 'Unknown error'
            }
          : e
      ))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            TrustMesh Issuer Studio
          </h1>
          <p className="text-gray-600 mt-2">
            Create and submit structured messages directly to HCS topics
          </p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-semibold">Network:</span> {process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}
            {' | '}
            <span className="font-semibold">Issuer:</span> <span className="font-mono">{ISSUER_ACCOUNT_ID}</span>
          </div>
        </div>
        
        {/* Two-column layout: Form left, Log right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Message Builder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SignalMintForm
              issuerAccountId={ISSUER_ACCOUNT_ID}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
          
          {/* Right: Event Log */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-auto">
            <EventLog events={events} />
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            TrustMesh Issuer Studio MVP v1.0 • Built for Hedera Testnet
          </p>
          <p className="mt-1">
            Messages are submitted to HCS topics and are immutable once confirmed
          </p>
        </div>
      </div>
    </div>
  )
}
