/**
 * Template Gallery
 * Displays available departmental recognition templates
 */

'use client'

import { useState } from 'react'
import { DEPARTMENT_TEMPLATES, RecognitionTemplate, getAllCategories } from '@/lib/issuer/templates'
import { Award, Users, Heart, Trophy, GraduationCap, Code, Globe, Lightbulb, Briefcase, ShieldCheck, Microscope } from 'lucide-react'

interface TemplateGalleryProps {
  selectedTemplateId?: string
  onSelectTemplate: (template: RecognitionTemplate) => void
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

export function TemplateGallery({ selectedTemplateId, onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const categories = getAllCategories()
  
  const filteredTemplates = selectedCategory
    ? DEPARTMENT_TEMPLATES.filter(t => t.category === selectedCategory)
    : DEPARTMENT_TEMPLATES
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Template Gallery
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a credential template to issue to students
        </p>
      </div>
      
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Template cards grid */}
      <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredTemplates.map(template => {
          const Icon = iconMap[template.badgeStyle.icon] || Award
          const isSelected = selectedTemplateId === template.id
          
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon with gradient */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.badgeStyle.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {template.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {template.category}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
      </div>
    </div>
  )
}
