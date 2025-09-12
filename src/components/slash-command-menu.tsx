"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
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
    <DropdownMenu open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DropdownMenuContent 
        className="w-80"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          transform: 'none'
        }}
        data-slash-menu
        side="bottom"
        align="start"
        sideOffset={0}
      >
        <DropdownMenuLabel className="text-xs">
          Slash Commands {searchQuery && `(filtered by "${searchQuery}")`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groupedCommands).map(([category, commands]) => (
          <DropdownMenuGroup key={category}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              {category}
            </DropdownMenuLabel>
            {commands.map((command, index) => {
              const globalIndex = filteredCommands.indexOf(command)
              const isSelected = globalIndex === selectedIndex
              
              return (
                <DropdownMenuItem
                  key={command.id}
                  onSelect={() => {
                    onSelect(command)
                    onClose()
                  }}
                  className={cn(
                    // Ensure hover/keyboard highlight shows clearly (Radix data state + hover)
                    "flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900",
                    isSelected && "bg-blue-50 text-blue-900"
                  )}
                >
                  <div className="flex-shrink-0 text-muted-foreground">
                    {command.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{command.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {command.description}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono opacity-60">
                    {command.id}
                  </div>
                </DropdownMenuItem>
              )
            })}
            {category !== 'Creative' && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
