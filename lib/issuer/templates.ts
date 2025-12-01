/**
 * Departmental Recognition Templates
 * Template library for university department heads
 */

export interface RecognitionTemplate {
  id: string
  label: string
  description: string
  category: 'Academic Excellence' | 'Leadership' | 'Service' | 'Research' | 'Professional Development'
  recommendedFillExample: string
  badgeStyle: {
    gradient: string // Tailwind gradient classes
    icon: string // Icon name for preview
    accentColor: string // Hex color
  }
}

export const DEPARTMENT_TEMPLATES: RecognitionTemplate[] = [
  {
    id: 'honors_seminar_grad',
    label: 'Honors Seminar Graduate',
    description: 'Recognizes completion of departmental honors seminar program with distinction',
    category: 'Academic Excellence',
    recommendedFillExample: 'Successfully completed Computer Science Honors Seminar (Fall 2024) with research presentation on distributed systems',
    badgeStyle: {
      gradient: 'from-purple-500 to-indigo-600',
      icon: 'award',
      accentColor: '#8B5CF6'
    }
  },
  {
    id: 'peer_mentor',
    label: 'Peer Mentor Recognition',
    description: 'Awarded to students who provided exceptional mentorship to their peers',
    category: 'Leadership',
    recommendedFillExample: 'Mentored 8 first-year students through their transition to university, holding weekly office hours and providing academic guidance',
    badgeStyle: {
      gradient: 'from-blue-500 to-cyan-600',
      icon: 'users',
      accentColor: '#3B82F6'
    }
  },
  {
    id: 'research_assistant',
    label: 'Research Assistant Excellence',
    description: 'Recognizes outstanding contributions to departmental research projects',
    category: 'Research',
    recommendedFillExample: 'Contributed to machine learning research project, co-authored paper submitted to ICML 2025',
    badgeStyle: {
      gradient: 'from-emerald-500 to-teal-600',
      icon: 'microscope',
      accentColor: '#10B981'
    }
  },
  {
    id: 'community_builder',
    label: 'Community Builder Award',
    description: 'Honors students who strengthened departmental community and culture',
    category: 'Service',
    recommendedFillExample: 'Organized weekly study groups, founded CS Women\'s Network chapter, coordinated 3 department social events',
    badgeStyle: {
      gradient: 'from-orange-500 to-amber-600',
      icon: 'heart',
      accentColor: '#F97316'
    }
  },
  {
    id: 'capstone_lead',
    label: 'Capstone Project Lead',
    description: 'Awarded to team leaders of outstanding senior capstone projects',
    category: 'Academic Excellence',
    recommendedFillExample: 'Led 5-person team in developing award-winning mobile health application, presented at department showcase',
    badgeStyle: {
      gradient: 'from-rose-500 to-pink-600',
      icon: 'trophy',
      accentColor: '#F43F5E'
    }
  },
  {
    id: 'teaching_assistant',
    label: 'Distinguished Teaching Assistant',
    description: 'Recognizes exceptional teaching assistants who enhanced course quality',
    category: 'Professional Development',
    recommendedFillExample: 'Served as Head TA for Data Structures (CS201), developed new lab materials, maintained 4.8/5.0 student rating',
    badgeStyle: {
      gradient: 'from-violet-500 to-purple-600',
      icon: 'graduation-cap',
      accentColor: '#8B5CF6'
    }
  },
  {
    id: 'hackathon_winner',
    label: 'Hackathon Excellence',
    description: 'Awarded to winners of departmental or university hackathons',
    category: 'Academic Excellence',
    recommendedFillExample: 'Won first place at Department Hackathon 2024 with blockchain-based supply chain solution',
    badgeStyle: {
      gradient: 'from-yellow-500 to-orange-600',
      icon: 'code',
      accentColor: '#EAB308'
    }
  },
  {
    id: 'diversity_advocate',
    label: 'Diversity & Inclusion Advocate',
    description: 'Recognizes efforts to promote diversity and inclusion in the department',
    category: 'Service',
    recommendedFillExample: 'Led department DEI committee, organized 5 inclusive tech workshops, mentored underrepresented students',
    badgeStyle: {
      gradient: 'from-pink-500 to-rose-600',
      icon: 'globe',
      accentColor: '#EC4899'
    }
  },
  {
    id: 'innovation_award',
    label: 'Innovation in Computing',
    description: 'Awarded for innovative technical projects or creative problem-solving',
    category: 'Research',
    recommendedFillExample: 'Developed novel algorithm for real-time video processing, achieving 40% performance improvement',
    badgeStyle: {
      gradient: 'from-cyan-500 to-blue-600',
      icon: 'lightbulb',
      accentColor: '#06B6D4'
    }
  },
  {
    id: 'service_learning',
    label: 'Service Learning Excellence',
    description: 'Recognizes impactful community service through technical projects',
    category: 'Service',
    recommendedFillExample: 'Built website for local nonprofit, taught coding workshops at community center, impacted 50+ residents',
    badgeStyle: {
      gradient: 'from-green-500 to-emerald-600',
      icon: 'hand-heart',
      accentColor: '#22C55E'
    }
  },
  {
    id: 'internship_distinction',
    label: 'Internship Distinction',
    description: 'Awarded for exceptional performance during industry internships',
    category: 'Professional Development',
    recommendedFillExample: 'Completed summer internship at Google, received return offer, contributed to production codebase',
    badgeStyle: {
      gradient: 'from-indigo-500 to-blue-600',
      icon: 'briefcase',
      accentColor: '#6366F1'
    }
  },
  {
    id: 'academic_integrity',
    label: 'Academic Integrity Champion',
    description: 'Recognizes consistent demonstration of ethical academic conduct',
    category: 'Academic Excellence',
    recommendedFillExample: 'Demonstrated exceptional academic integrity across 4 years, served on honor code committee',
    badgeStyle: {
      gradient: 'from-slate-500 to-gray-700',
      icon: 'shield-check',
      accentColor: '#64748B'
    }
  }
]

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): RecognitionTemplate | undefined {
  return DEPARTMENT_TEMPLATES.find(t => t.id === templateId)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: RecognitionTemplate['category']): RecognitionTemplate[] {
  return DEPARTMENT_TEMPLATES.filter(t => t.category === category)
}

/**
 * Get all categories
 */
export function getAllCategories(): RecognitionTemplate['category'][] {
  return Array.from(new Set(DEPARTMENT_TEMPLATES.map(t => t.category)))
}
