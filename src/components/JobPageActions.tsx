'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, FileText, MessageSquare, Copy, Check } from 'lucide-react'

interface JobPageActionsProps {
  markdownUrl: string
  pageUrl: string
  jobTitle: string
  companyName: string
}

export function JobPageActions({ markdownUrl, pageUrl, jobTitle, companyName }: JobPageActionsProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
    setOpen(false)
  }

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(`Summarize this job posting: ${pageUrl}`)}`

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors w-full justify-between"
      >
        <span className="flex items-center gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Page'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full left-0 right-0 mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-md transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <a
            href={markdownUrl}
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors rounded-t-md"
            onClick={() => setOpen(false)}
          >
            <FileText className="h-4 w-4" />
            View as Markdown
          </a>
          <a
            href={chatGptUrl}
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <MessageSquare className="h-4 w-4" />
            Open in ChatGPT
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors w-full text-left rounded-b-md"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Page URL'}
          </button>
        </div>
    </div>
  )
}
