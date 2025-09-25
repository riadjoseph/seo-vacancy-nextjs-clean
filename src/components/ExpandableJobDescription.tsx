'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableJobDescriptionProps {
  description: string
  previewHeight?: string
}

export function ExpandableJobDescription({ 
  description, 
  previewHeight = '200px' 
}: ExpandableJobDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if content is long enough to need expansion (rough estimation)
  const isLongContent = description.length > 400
  
  if (!isLongContent) {
    return (
      <div className="rich-article ">
        <ReactMarkdown>
          {description}
        </ReactMarkdown>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div 
        className={`rich-article  relative ${
          !isExpanded ? 'overflow-hidden' : ''
        }`}
        style={{
          maxHeight: !isExpanded ? previewHeight : 'none'
        }}
      >
        <ReactMarkdown>
          {description}
        </ReactMarkdown>
        
        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"
          />
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Read Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Read More
          </>
        )}
      </Button>
    </div>
  )
}
