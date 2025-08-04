"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { X } from "lucide-react"

// ----------------------------------------------------
// Context
// ----------------------------------------------------

type SidebarContextValue = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("Sidebar components must be used within <SidebarProvider>")
  return ctx
}

// ----------------------------------------------------
// Layout components
// ----------------------------------------------------

export function Sidebar({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isOpen, close } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 shrink-0 transform-gpu bg-background border-r transition-transform duration-200 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Close button for mobile */}
      <div className="md:hidden flex justify-end p-2 border-b">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {children}
    </aside>
  )
}

export function SidebarInset({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col flex-1", className)}>
      {children}
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={toggle}
      {...props}
    />
  )
}

export function SidebarHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b", className)}>{children}</div>
}

export function SidebarContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
}

export function SidebarGroup({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4", className)}>{children}</div>
}

export function SidebarGroupLabel({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-2 text-xs font-semibold text-muted-foreground uppercase", className)}>{children}</div>
}

export function SidebarMenu({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function SidebarMenuButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
