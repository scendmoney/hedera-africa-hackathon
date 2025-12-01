/**
 * TrustMesh Issuer Studio MVP - Department Issuer Console
 * 
 * University Department Head interface for issuing on-chain credentials to students.
 * Features template gallery, live preview, and credential issuance tracking.
 */

'use client'

import { useState, useEffect } from 'react'
import { ulid } from 'ulid'
import { ShieldAlert } from 'lucide-react'
import { SignalMintForm } from '@/components/issuer/SignalMintForm'
import { EventLog } from '@/components/issuer/EventLog'
import { IssuerHeader } from '@/components/issuer/IssuerHeader'
import { TemplateGallery } from '@/components/issuer/TemplateGallery'
import { DesignStudio } from '@/components/issuer/DesignStudio'
import { buildSignalMintEnvelope } from '@/lib/issuer/envelopeBuilder'
import { 
  SubmittedEvent, 
  SignalMintPayload, 
  IssuerSubmitResponse 
} from '@/lib/issuer/types'
import { RecognitionTemplate } from '@/lib/issuer/templates'

// Hardcoded issuer account for MVP (can be made configurable later)
const ISSUER_ACCOUNT_ID = process.env.NEXT_PUBLIC_ISSUER_ACCOUNT_ID || '0.0.4851773'

// Right panel tabs
type RightPanelTab = 'templates' | 'design' | 'issuance'

export default function IssuerStudioPage() {
  // Auth state (simplified for MVP - can be enhanced with proper RBAC)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Dashboard state
  const [events, setEvents] = useState<SubmittedEvent[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<RightPanelTab>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<RecognitionTemplate | null>(null)
  const [formData, setFormData] = useState({
    templateId: '',
    recipientAccountId: '',
    fill: '',
    note: ''
  })
  
  // Simple auth check (for MVP - checks if user is logged in)
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)
      try {
        // For MVP, we'll allow access if user is logged in
        // In production, you'd check for specific issuer role
        if (typeof window !== 'undefined') {
          const { magic } = await import('@/lib/magic')
          const isLoggedIn = await magic.user.isLoggedIn()
          setIsAuthorized(isLoggedIn)
        } else {
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error('[Issuer] Auth check failed:', error)
        setIsAuthorized(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Handle template selection from gallery
  const handleSelectTemplate = (template: RecognitionTemplate) => {
    setSelectedTemplate(template)
    setActiveTab('design')  // Switch to design studio to see preview
  }
  
  // Handle form data changes for live preview
  const handleFormDataChange = (data: { templateId: string; recipientAccountId: string; fill: string; note: string }) => {
    setFormData(data)
  }
  
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
  
  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Checking authorization...</p>
        </div>
      </div>
    )
  }
  
  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restricted Area</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You need issuer access to use the Department Issuer Console.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-400">
            <p className="font-medium mb-1">For MVP Testing:</p>
            <p>Please sign in to access the issuer console.</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }
  
  // Authorized - show dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <IssuerHeader 
          issuerAccountId={ISSUER_ACCOUNT_ID}
          network={process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}
        />
        
        {/* Main dashboard: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Issue Recognition Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <SignalMintForm
              issuerAccountId={ISSUER_ACCOUNT_ID}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              selectedTemplate={selectedTemplate}
              onFormDataChange={handleFormDataChange}
            />
          </div>
          
          {/* Right: Tabbed Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Template Gallery
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'design'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Design Studio
              </button>
              <button
                onClick={() => setActiveTab('issuance')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'issuance'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Recent Issuance
              </button>
            </div>
            
            {/* Tab content */}
            <div className="p-6 overflow-auto max-h-[800px]">
              {activeTab === 'templates' && (
                <TemplateGallery
                  selectedTemplateId={selectedTemplate?.id}
                  onSelectTemplate={handleSelectTemplate}
                />
              )}
              
              {activeTab === 'design' && (
                <DesignStudio
                  selectedTemplate={selectedTemplate}
                  fillText={formData.fill}
                  recipientAccountId={formData.recipientAccountId}
                  note={formData.note}
                />
              )}
              
              {activeTab === 'issuance' && (
                <EventLog events={events} />
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Department Issuer Console v2.0 • On-chain Credentials via Hedera</p>
          <p>Credentials are immutably recorded and verifiable on the blockchain</p>
        </div>
      </div>
    </div>
  )
}
