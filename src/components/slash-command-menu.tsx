"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { 
  Bot, 
  Code, 
  FileText, 
  Image, 
  Lightbulb, 
  Search, 
  Zap 
} from 'lucide-react'

export interface SlashCommand {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  command: string
  category: string
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'ask',
    label: 'Ask a question',
    description: 'Ask me anything and get a detailed answer',
    icon: <Bot className="h-4 w-4" />,
    command: 'Please help me understand: ',
    category: 'General'
  },
  {
    id: 'explain',
    label: 'Explain concept',
    description: 'Get a clear explanation of any topic',
    icon: <Lightbulb className="h-4 w-4" />,
    command: 'Can you explain ',
    category: 'General'
  },
  {
    id: 'code',
    label: 'Write code',
    description: 'Generate code for any programming language',
    icon: <Code className="h-4 w-4" />,
    command: 'Write code to ',
    category: 'Development'
  },
  {
    id: 'debug',
    label: 'Debug code',
    description: 'Help debug and fix code issues',
    icon: <Zap className="h-4 w-4" />,
    command: 'Help me debug this code:\n\n```\n\n```\n\nThe issue is: ',
    category: 'Development'
  },
  {
    id: 'summarize',
    label: 'Summarize text',
    description: 'Create a concise summary of any text',
    icon: <FileText className="h-4 w-4" />,
    command: 'Please summarize the following text:\n\n',
    category: 'Text'
  },
  {
    id: 'translate',
    label: 'Translate text',
    description: 'Translate text to any language',
    icon: <Search className="h-4 w-4" />,
    command: 'Translate this to [language]: ',
    category: 'Text'
  },
  {
    id: 'generate-image',
    label: 'Generate image',
    description: 'Create an image from a text description',
    icon: <Image className="h-4 w-4" />,
    command: 'Generate an image of ',
    category: 'Creative'
  }
]

interface SlashCommandMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (command: SlashCommand) => void
  position: { top: number; left: number }
  searchQuery?: string
  selectedIndex?: number
}

export function SlashCommandMenu({ 
  isOpen, 
  onClose, 
  onSelect, 
  position, 
  searchQuery = '',
  selectedIndex = 0
}: SlashCommandMenuProps) {
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>(SLASH_COMMANDS)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCommands(SLASH_COMMANDS)
    } else {
      const filtered = SLASH_COMMANDS.filter(command =>
        command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        command.command.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCommands(filtered)
    }
  }, [searchQuery])

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, SlashCommand[]>)

  if (!isOpen) return null

  return (
    <div
      data-slash-menu
      className="fixed z-[9999] w-80 pointer-events-auto"
      style={{ top: position.top, left: position.left, pointerEvents: 'auto' }}
      onPointerDownCapture={(e) => {
        // High-signal debug so we know events hit the overlay
        console.debug('SlashCommandMenu.wrapper onPointerDownCapture', {
          target: (e.target as HTMLElement)?.tagName,
          class: (e.target as HTMLElement)?.className,
        })
      }}
    >
      <Command shouldFilter={false} className="rounded-lg border bg-popover text-popover-foreground shadow-md">
        <CommandList
          className="max-h-64"
          onPointerDown={(e) => {
            console.debug('SlashCommandMenu.list onPointerDown')
          }}
        >
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <CommandGroup key={category} heading={category}>
              {commands.map((command) => {
                return (
                  <CommandItem
                    key={command.id}
                    onSelect={() => {
                      console.debug("SlashCommandMenu.onSelect (keyboard)", command.id)
                      onSelect(command)
                      onClose()
                    }}
                    onMouseDown={(e) => {
                      // Ensure mouse clicks trigger selection without blurring textarea
                      console.debug("SlashCommandMenu.onMouseDown (mouse)", {
                        id: command.id,
                      })
                      e.preventDefault()
                      e.stopPropagation()
                      onSelect(command)
                      // Defer close so state updates don’t race with detection effect
                      setTimeout(() => {
                        onClose()
                        console.debug("SlashCommandMenu.onMouseDown -> onClose()")
                      }, 0)
                    }}
                    onMouseEnter={() => setHoveredId(command.id)}
                    onMouseLeave={() => setHoveredId((prev) => (prev === command.id ? null : prev))}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-900 aria-selected:bg-blue-50 aria-selected:text-blue-900",
                      hoveredId === command.id && "bg-blue-50 text-blue-900"
                    )}
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {command.icon}
                    </div>
                    <div className="font-medium text-sm">{command.label}</div>
                  </CommandItem>
                )
              })}
              <CommandSeparator />
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
