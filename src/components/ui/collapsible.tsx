import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const CollapsibleContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(({ asChild, defaultOpen = false, open: controlledOpen, onOpenChange, className, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  return <CollapsibleContext.Provider value={{ open, setOpen }}>
    <div ref={ref} className={cn("", className)} {...props}>{children}</div>
  </CollapsibleContext.Provider>
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(CollapsibleContext)
  return <button ref={ref} onClick={() => setOpen(!open)} data-state={open ? "open" : "closed"} className={cn("", className)} {...props} />
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { open } = React.useContext(CollapsibleContext)
  if (!open) return null
  return <div ref={ref} data-state={open ? "open" : "closed"} className={cn("", className)} {...props} />
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
