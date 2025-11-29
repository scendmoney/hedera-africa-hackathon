/**
 * Issuer Studio SIGNAL_MINT Form
 * Form for creating SIGNAL_MINT messages (recognition signals)
 */

'use client'

import { useState } from 'react'
import { SignalMintPayload } from '@/lib/issuer/types'

interface SignalMintFormProps {
  issuerAccountId: string
  onSubmit: (payload: SignalMintPayload) => void
  isSubmitting: boolean
}

export function SignalMintForm({ 
  issuerAccountId, 
  onSubmit, 
  isSubmitting 
}: SignalMintFormProps) {
  const [templateId, setTemplateId] = useState('')
  const [recipientAccountId, setRecipientAccountId] = useState('')
  const [fill, setFill] = useState('')
  const [note, setNote] = useState('')
  const [evidence, setEvidence] = useState('')
  const [error, setError] = useState<string | null>(null)
  
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
        <h2 className="text-xl font-bold">SIGNAL_MINT Message</h2>
        <div className="text-sm text-gray-600">
          Create a recognition signal for a recipient
        </div>
      </div>
      
      {/* Issuer Account (read-only) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Issuer Account ID
        </label>
        <input
          type="text"
          value={issuerAccountId}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 font-mono text-sm"
        />
      </div>
      
      {/* Template ID */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Template ID *
        </label>
        <input
          type="text"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          placeholder="e.g., peer_mentor"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          Enter template ID without prefix/suffix (will become grit.template_id@1)
        </div>
      </div>
      
      {/* Recipient Account ID */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Recipient Account ID *
        </label>
        <input
          type="text"
          value={recipientAccountId}
          onChange={(e) => setRecipientAccountId(e.target.value)}
          placeholder="0.0.12345"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          Hedera account ID (format: 0.0.xxxxx)
        </div>
      </div>
      
      {/* Fill Text */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fill Text *
        </label>
        <textarea
          value={fill}
          onChange={(e) => setFill(e.target.value)}
          placeholder="Enter the recognition message..."
          disabled={isSubmitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          {fill.length} characters
        </div>
      </div>
      
      {/* Note (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add an optional note..."
          disabled={isSubmitting}
          rows={2}
          maxLength={120}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          {note.length}/120 characters
        </div>
      </div>
      
      {/* Evidence (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Evidence URL (optional)
        </label>
        <input
          type="text"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="https://... or ipfs://..."
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          Optional link to supporting evidence (URL or IPFS hash)
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting to HCS...' : 'Submit to Hedera'}
      </button>
      
      <div className="text-xs text-gray-500 italic">
        * Required fields
      </div>
    </form>
  )
}
