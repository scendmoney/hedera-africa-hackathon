/**
 * Issuer Studio SIGNAL_MINT Form
 * Form for creating SIGNAL_MINT messages (recognition signals)
 */

'use client'

import { useState, useEffect } from 'react'
import { SignalMintPayload } from '@/lib/issuer/types'
import { RecognitionTemplate } from '@/lib/issuer/templates'

interface SignalMintFormProps {
  issuerAccountId: string
  onSubmit: (payload: SignalMintPayload) => void
  isSubmitting: boolean
  selectedTemplate?: RecognitionTemplate | null
  onFormDataChange?: (data: { templateId: string; recipientAccountId: string; fill: string; note: string }) => void
}

export function SignalMintForm({ 
  issuerAccountId, 
  onSubmit, 
  isSubmitting,
  selectedTemplate,
  onFormDataChange
}: SignalMintFormProps) {
  const [templateId, setTemplateId] = useState('')
  const [recipientAccountId, setRecipientAccountId] = useState('')
  const [fill, setFill] = useState('')
  const [note, setNote] = useState('')
  const [evidence, setEvidence] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Sync template selection from gallery
  useEffect(() => {
    if (selectedTemplate) {
      setTemplateId(selectedTemplate.id)
      // Optionally pre-fill with example
      if (!fill) {
        setFill('')  // Don't auto-fill, let user type
      }
    }
  }, [selectedTemplate])
  
  // Notify parent of form data changes for live preview
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({ templateId, recipientAccountId, fill, note })
    }
  }, [templateId, recipientAccountId, fill, note, onFormDataChange])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic client-side validation
    if (!templateId.trim()) {
      setError('Template ID is required')
      return
    }
    
    if (!recipientAccountId.trim()) {
      setError('Recipient account ID is required')
      return
    }
    
    if (!recipientAccountId.match(/^0\.0\.\d+$/)) {
      setError('Recipient account ID must be in format 0.0.xxxxx')
      return
    }
    
    if (!fill.trim()) {
      setError('Fill text is required')
      return
    }
    
    if (note.length > 120) {
      setError('Note must be 120 characters or less')
      return
    }
    
    // Build payload
    const payload: SignalMintPayload = {
      templateId: templateId.trim(),
      recipientAccountId: recipientAccountId.trim(),
      fill: fill.trim(),
      ...(note.trim() && { note: note.trim() }),
      ...(evidence.trim() && { evidence: evidence.trim() })
    }
    
    onSubmit(payload)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Issue Credential</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Create an on-chain credential for a student
        </div>
        {selectedTemplate && (
          <div className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-700 dark:text-blue-400">
            Selected: <span className="font-semibold">{selectedTemplate.label}</span>
          </div>
        )}
      </div>
      
      {/* Issuer Account (read-only) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Department Issuer Account
        </label>
        <input
          type="text"
          value={issuerAccountId}
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono text-sm"
        />
      </div>
      
      {/* Template ID */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Credential Template *
        </label>
        <input
          type="text"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          placeholder="e.g., honors_seminar_grad"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedTemplate ? (
            <span className="text-green-600 dark:text-green-400">✓ Template selected from gallery</span>
          ) : (
            <span>Choose from gallery or enter template ID</span>
          )}
        </div>
      </div>
      
      {/* Recipient Account ID */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Student's Hedera Account ID *
        </label>
        <input
          type="text"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
          placeholder="0.0.12345"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Student's blockchain account (format: 0.0.xxxxx)
        </div>
      </div>
      
      {/* Fill Text */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          What are you recognizing this student for? *
        </label>
        <textarea
          value={fill}
          onChange={(e) => setFill(e.target.value)}
          placeholder={selectedTemplate?.recommendedFillExample || "Describe the student's achievement or contribution..."}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {fill.length} characters • Be specific about their contribution
        </div>
      </div>
      
      {/* Note (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Internal Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Department-only note (e.g., semester, course number)..."
          disabled={isSubmitting}
          rows={2}
          maxLength={120}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {note.length}/120 characters
        </div>
      </div>
      
      {/* Evidence (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Supporting Evidence (optional)
        </label>
        <input
          type="text"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="https://... or ipfs://..."
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Link to portfolio, project, or documentation
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? 'Issuing to Blockchain...' : 'Issue Credential to Hedera'}
      </button>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
        <p className="font-medium mb-1">What happens next:</p>
        <p>When you submit, this credential will be immutably recorded on Hedera and visible in the student's TrustMesh portfolio.</p>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        * Required fields
      </div>
    </form>
  )
}
