"use client"

import { useState, useEffect, useRef } from 'react'
import { SlashCommand } from '@/components/slash-command-menu'

// Import the commands directly to get the filtered list
const SLASH_COMMANDS = [
  { id: 'ask', command: 'Please help me understand: ' },
  { id: 'explain', command: 'Can you explain ' },
  { id: 'code', command: 'Write code to ' },
  { id: 'debug', command: 'Help me debug this code:\n\n```\n\n```\n\nThe issue is: ' },
  { id: 'summarize', command: 'Please summarize the following text:\n\n' },
  { id: 'translate', command: 'Translate this to [language]: ' },
  { id: 'generate-image', command: 'Generate an image of ' }
]

interface UseSlashCommandProps {
  value: string
  onValueChange: (value: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export function useSlashCommand({ value, onValueChange, textareaRef }: UseSlashCommandProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS)
  const slashIndexRef = useRef<number>(-1)

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCommands(SLASH_COMMANDS)
    } else {
      const filtered = SLASH_COMMANDS.filter(command =>
        command.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        command.command.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCommands(filtered)
    }
    setSelectedIndex(0)
  }, [searchQuery])

  // Detect slash command
  useEffect(() => {
    if (!textareaRef.current) return
    
    // Get current cursor position
    const cursorPos = textareaRef.current.selectionStart || 0
    setCursorPosition(cursorPos)
    
    // Find the last slash before cursor
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/')
    
    // Check if we're in a slash command context
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1)
      const hasSpaceAfterSlash = textAfterSlash.includes(' ') || textAfterSlash.includes('\n')
      
      // Only show menu if:
      // 1. There's no space/newline after the slash
      // 2. The slash is at the beginning of a line or after whitespace
      const textBeforeSlash = textBeforeCursor.substring(0, lastSlashIndex)
      const isSlashAtWordBoundary = lastSlashIndex === 0 || 
        /\s$/.test(textBeforeSlash) || 
        textBeforeSlash.endsWith('\n')
      
      if (!hasSpaceAfterSlash && isSlashAtWordBoundary) {
        // We're in a slash command
        slashIndexRef.current = lastSlashIndex
        setSearchQuery(textAfterSlash)
        setIsOpen(true)
        // Delay position update to ensure DOM is ready
        setTimeout(updateMenuPosition, 0)
        return
      }
    }
    
    // Not in slash command context
    setIsOpen(false)
    slashIndexRef.current = -1
  }, [value])

  const updateMenuPosition = () => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const rect = textarea.getBoundingClientRect()
    
    // Calculate position based on cursor
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length - 1
    const lineHeight = 24 // More accurate line height
    const padding = 12 // Textarea padding
    
    // Calculate initial position
    let top = rect.top + (currentLine * lineHeight) + lineHeight + padding + 8
    let left = rect.left + padding
    
    // Prevent menu from going off-screen
    const menuHeight = 300 // Approximate menu height
    const menuWidth = 320 // Menu width
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Adjust vertical position if menu would go below viewport
    if (top + menuHeight > viewportHeight) {
      top = rect.top - menuHeight - 8 // Show above the textarea
    }
    
    // Adjust horizontal position if menu would go off right edge
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 16
    }
    
    // Ensure menu doesn't go off left edge
    if (left < 16) {
      left = 16
    }
    
    setMenuPosition({ top, left })
  }

  const handleCommandSelect = (command: SlashCommand) => {
    if (slashIndexRef.current === -1) return

    const beforeSlash = value.substring(0, slashIndexRef.current)
    const afterCursor = value.substring(cursorPosition)
    const newValue = beforeSlash + command.command + ' ' + afterCursor

    onValueChange(newValue)
    setIsOpen(false)
    slashIndexRef.current = -1

    // Focus back to textarea and position cursor
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeSlash.length + command.command.length + 1
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return false

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        slashIndexRef.current = -1
        return true
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        return true
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        return true
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          const command = filteredCommands[selectedIndex]
          handleCommandSelect({ 
            id: command.id, 
            command: command.command,
            label: '',
            description: '',
            icon: null,
            category: ''
          })
        }
        return true
    }
    
    return false // Let other keys pass through for continued typing
  }

  return {
    isOpen,
    searchQuery,
    menuPosition,
    selectedIndex,
    handleCommandSelect,
    handleKeyDown,
    closeMenu: () => {
      setIsOpen(false)
      slashIndexRef.current = -1
    }
  }
}
