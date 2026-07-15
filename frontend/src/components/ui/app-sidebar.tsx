"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Logo from "../shared/Logo"
import { cn } from "@/utils/cn"
import { useCalendarActions } from "@/stores/calendar/useCalendarActions"
import { SidebarUserButton } from "@/components/account"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "./sidebar"
import {
  Calendar,
  CheckSquare,
  CalendarRange,
  Plus,
  Menu,
  X,
} from "lucide-react"

export default function AppSidebar() {
  const { toggleSidebar, state } = useSidebar()
  const collapsed = state === "collapsed"
  const pathname = usePathname()
  const router = useRouter()
  const { openCreateModal } = useCalendarActions()

  // Open the create-event modal with a default 1-hour slot starting now, then
  // route to the calendar where <EventModal /> lives (it reads modal state from
  // the store, so it opens as soon as the page mounts).
  const handleNewEvent = () => {
    const start = new Date()
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    openCreateModal({ start, end })
    router.push("/dashboard/calendar")
  }

  const navigationItems = [
    {
      title: "Calendar",
      icon: Calendar,
      url: "/dashboard/calendar",
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      url: "/dashboard/tasks",
    },
    {
      title: "Periods",
      icon: CalendarRange,
      url: "/dashboard/periods",
    },
  ]

  // Active = exact match OR a descendant route under the tab's URL (so
  // `/dashboard/periods/abc123` still highlights "Periods"). `pathname`
  // is null only during the very first client render; treat that as no match.
  const isItemActive = (url: string): boolean => {
    if (!pathname) return false
    if (pathname === url) return true
    return pathname.startsWith(`${url}/`)
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out"
      )}
    >
      {/* Header: logo + toggle. Collapsed -> single centered toggle. */}
      <SidebarHeader
        className={cn(
          "h-14 border-b border-sidebar-border/50",
          "flex flex-row items-center",
          "px-4 group-data-[collapsible=icon]:px-0",
          "group-data-[collapsible=icon]:justify-center",
          "justify-between"
        )}
      >
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>

        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-lg",
            "text-sidebar-foreground/70 hover:text-sidebar-foreground",
            "hover:bg-sidebar-accent transition-colors duration-200"
          )}
        >
          {collapsed ? (
            <Menu className="w-[18px] h-[18px]" />
          ) : (
            <X className="w-[18px] h-[18px]" />
          )}
        </button>
      </SidebarHeader>

      {/* NEW EVENT button. Collapsed -> compact 40x40 centered. */}
      <div
        className={cn(
          "pt-4 pb-2 px-4",
          "group-data-[collapsible=icon]:px-0",
          "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
        )}
      >
        <button
          aria-label="New event"
          onClick={handleNewEvent}
          className={cn(
            "font-space-grotesk font-bold uppercase tracking-wide flex items-center justify-center",
            "rounded-lg border border-green-nice/40 bg-green-nice/15 text-sm text-green-200",
            "hover:bg-green-nice/25 active:scale-[0.98]",
            "transition-all duration-200",
            "h-10 w-full gap-2 px-4 whitespace-nowrap overflow-hidden",
            "group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9",
            "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:rounded-lg"
          )}
        >
          <Plus className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">
            NEW EVENT
          </span>
        </button>
      </div>

      {/* Navigation. */}
      <SidebarContent className="px-0 py-2">
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => {
                const active = isItemActive(item.url)
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      "px-3 group-data-[collapsible=icon]:px-0",
                      "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                    )}
                  >
                    <Link
                      href={item.url}
                      title={item.title}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center transition-colors duration-200",
                        "h-10 w-full rounded-lg gap-3 px-3",
                        "group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9",
                        "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
                        active
                          ? "bg-green-nice/15 text-green-nice"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-green-nice group-data-[collapsible=icon]:hidden" />
                      )}
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="text-sm font-medium font-space-grotesk uppercase tracking-wide group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile. Clickable -> opens account dialog with logout.
          Collapsed -> a single centered avatar. */}
      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border/50",
          "p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-3",
          "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
        )}
      >
        <SidebarUserButton />
      </SidebarFooter>
    </Sidebar>
  )
}
