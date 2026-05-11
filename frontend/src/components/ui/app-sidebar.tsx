"use client"

import Logo from "../shared/Logo"
import { cn } from "@/utils/cn"
import { useAuthStore } from "@/stores/authStore"
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
  Target,
  Settings,
  Plus,
  Menu,
  X,
} from "lucide-react"

export default function AppSidebar() {
  const { toggleSidebar, state } = useSidebar()
  const { user, isAuthenticated } = useAuthStore()
  const collapsed = state === "collapsed"

  const navigationItems = [
    {
      title: "Calendar",
      icon: Calendar,
      url: "/dashboard/calendar",
      isActive: true,
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      url: "/dashboard/tasks",
      isActive: false,
    },
    {
      title: "Habits",
      icon: Target,
      url: "/dashboard/habits",
      isActive: false,
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/dashboard/settings",
      isActive: false,
    },
  ]

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
          className={cn(
            "font-space-grotesk font-bold flex items-center justify-center",
            "bg-green-nice text-white text-sm shadow-sm",
            "hover:bg-green-nice/90 active:scale-[0.98]",
            "transition-all duration-200",
            "h-10 w-full rounded-lg gap-2 px-4 whitespace-nowrap overflow-hidden",
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
              {navigationItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={cn(
                    "px-3 group-data-[collapsible=icon]:px-0",
                    "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  )}
                >
                  <a
                    href={item.url}
                    title={item.title}
                    className={cn(
                      "relative flex items-center transition-colors duration-200",
                      "h-10 w-full rounded-lg gap-3 px-3",
                      "group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9",
                      "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0",
                      item.isActive
                        ? "bg-green-nice/15 text-green-nice"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {item.isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-green-nice group-data-[collapsible=icon]:hidden" />
                    )}
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="text-sm font-medium font-space-grotesk uppercase tracking-wide group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile. Collapsed -> a single centered avatar. */}
      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border/50",
          "p-4 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-3",
          "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
        )}
      >
        {isAuthenticated && (
          <div
            className={cn(
              "flex items-center gap-3 min-w-0",
              "group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full",
                "bg-green-nice/20 text-green-nice font-bold text-sm",
                "h-9 w-9 shrink-0"
              )}
            >
              <span>{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
