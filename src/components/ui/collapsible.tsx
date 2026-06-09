import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Ctx = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} })

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(({ asChild, defaultOpen = false, open: controlledOpen, onOpenChange, className, children, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  return <Ctx.Provider value={{ open, setOpen }}><div ref={ref} data-state={open ? "open" : "closed"} className={cn("", className)} {...props}>{children}</div></Ctx.Provider>
})
Collapsible.displayName = "Collapsible"

interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ asChild, className, ...props }, ref) => {
  const { open, setOpen } = React.useContext(Ctx)
  const Comp = asChild ? React.Fragment : "button"
  const extraProps = asChild ? {} : { ref, onClick: () => setOpen(!open), "data-state": open ? "open" : "closed" as string }
  return <Comp className={!asChild ? cn("", className) : undefined} {...extraProps} {...props} />
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { open } = React.useContext(Ctx)
  if (!open) return null
  return <div ref={ref} data-state="open" className={cn("", className)} {...props} />
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
