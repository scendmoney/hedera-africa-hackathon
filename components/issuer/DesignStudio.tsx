/**
 * Design Studio
 * Live preview of credential being designed
 */

'use client'

import { RecognitionTemplate } from '@/lib/issuer/templates'
import { Award, Users, Heart, Trophy, GraduationCap, Code, Globe, Lightbulb, Briefcase, ShieldCheck, Microscope, Sparkles } from 'lucide-react'

interface DesignStudioProps {
  selectedTemplate: RecognitionTemplate | null
  fillText: string
  recipientAccountId: string
  note?: string
  issuerDisplayName?: string
}

// Icon mapping
const iconMap: Record<string, any> = {
  'award': Award,
  'users': Users,
  'heart': Heart,
  'trophy': Trophy,
  'graduation-cap': GraduationCap,
  'code': Code,
  'globe': Globe,
  'lightbulb': Lightbulb,
  'hand-heart': Heart,  // Using Heart as fallback
  'briefcase': Briefcase,
  'shield-check': ShieldCheck,
  'microscope': Microscope
}

export function DesignStudio({
  selectedTemplate,
  fillText,
  recipientAccountId,
  note,
  issuerDisplayName = 'Department of Computer Science'
}: DesignStudioProps) {
  
  if (!selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Design Studio
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a template to see live preview
          </p>
        </div>
        
        <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center space-y-3 p-6">
            <Sparkles className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No template selected
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Choose a template from the gallery to see a live preview of your credential
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  const Icon = iconMap[selectedTemplate.badgeStyle.icon] || Award
  const hasContent = fillText.trim().length > 0 || recipientAccountId.trim().length > 0
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Design Studio
          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
            Live Preview
          </span>
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This is how the credential will appear
        </p>
      </div>
      
      {/* Credential preview card - NFT style */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedTemplate.badgeStyle.gradient}`} />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        
        {/* Content */}
        <div className="relative h-full p-6 flex flex-col text-white">
          {/* Header */}
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {issuerDisplayName}
            </div>
            <div className="text-xs opacity-75">University Recognition</div>
          </div>
          
          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <Icon className="w-10 h-10" />
            </div>
            
            {/* Template label */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                {selectedTemplate.label}
              </h3>
              <div className="text-xs opacity-80 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full inline-block">
                {selectedTemplate.category}
              </div>
            </div>
            
            {/* Fill text (what they're being recognized for) */}
            {fillText.trim() ? (
              <div className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-sm leading-relaxed text-center line-clamp-4">
                  {fillText}
                </p>
              </div>
            ) : (
              <div className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-dashed border-white/30">
                <p className="text-xs text-center opacity-60 italic">
                  Recognition details will appear here...
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="space-y-2">
            {/* Recipient */}
            <div className="text-xs space-y-1">
              <div className="opacity-75">Awarded to:</div>
              {recipientAccountId.trim() ? (
                <div className="font-mono text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded truncate">
                  {recipientAccountId}
                </div>
              ) : (
                <div className="font-mono text-xs bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-dashed border-white/30 opacity-50">
                  Student account ID...
                </div>
              )}
            </div>
            
            {/* Note if present */}
            {note && note.trim() && (
              <div className="text-xs opacity-75 italic px-2 py-1 bg-white/10 backdrop-blur-sm rounded">
                "{note}"
              </div>
            )}
            
            {/* Blockchain indicator */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/20">
              <span className="opacity-75">On-chain Credential</span>
              <span className="opacity-60">Hedera HCS</span>
            </div>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      </div>
      
      {/* Status indicator */}
      {hasContent ? (
        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Ready to issue
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          Fill in details to prepare credential
        </div>
      )}
    </div>
  )
}
