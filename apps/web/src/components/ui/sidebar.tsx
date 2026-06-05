import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{ collapsed: boolean; setCollapsed: (v: boolean) => void }>({ collapsed: false, setCollapsed: () => {} })

const SidebarProvider = ({ children, ...props }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = React.useState(false)
  return <SidebarContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarContext.Provider>
}

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { collapsible?: string }>(({ className, ...props }, ref) => {
  const { collapsed } = React.useContext(SidebarContext)
  return <div ref={ref} className={cn("flex h-full flex-col border-r bg-background transition-all", collapsed ? "w-16" : "w-64", className)} {...props} />
})
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-14 items-center border-b px-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t p-4", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("absolute right-0 top-0 h-full w-1 cursor-col-resize", className)} {...props} />
))
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-1 flex-col", className)} {...props} />
))
SidebarInset.displayName = "SidebarInset"

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  const { collapsed, setCollapsed } = React.useContext(SidebarContext)
  return <button ref={ref} onClick={() => setCollapsed(!collapsed)} className={cn("p-2 hover:bg-muted rounded-md", className)} {...props}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
  </button>
})
SidebarTrigger.displayName = "SidebarTrigger"

export { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarRail }
