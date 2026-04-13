"use client"

import { useState } from "react"
import Logo from "../shared/Logo"
import { cn } from "@/utils/cn"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem
} from "./sidebar"
import { 
  Calendar,
  CheckSquare,
  Target,
  Settings,
  Plus,
  Menu,
  X
} from "lucide-react"

export default function AppSidebar(){
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navigationItems = [
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard",
        isActive: true
      },
      {
        title: "Tasks", 
        icon: CheckSquare,
        url: "/dashboard/tasks",
        isActive: false
      },
      {
        title: "Habits",
        icon: Target,
        url: "/dashboard/habits",
        isActive: false
      },
      {
        title: "Settings",
        icon: Settings,
        url: "/dashboard/settings",
        isActive: false
      }
    ]

    return (
        <Sidebar className={cn(
          "bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? 'w-16' : 'w-64'
        )}>
          {/* Clean Header Section */}
          <SidebarHeader className={cn(
            "p-4 flex flex-row items-center justify-between",
            "border-b border-sidebar-border/50"
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Logo />
                
              </div>
            )}
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent text-sidebar-foreground/70",
                "hover:text-sidebar-foreground",
                isCollapsed ? 'mx-auto' : 'ml-auto'
              )}
            >
              {isCollapsed ? (
                <Menu className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </SidebarHeader>

          {/* NEW EVENT Button */}
          <div className={cn(
            "pt-6 pb-2",
            isCollapsed ? "px-0" : "px-4"
          )}>
            <button className={cn(
              "font-space-grotesk font-bold flex items-center justify-center transition-all duration-200",
              "bg-green-nice/50 text-white text-sm hover:bg-green-nice/90 hover:scale-[1.02] shadow-sm",
              "h-10 flex-nowrap whitespace-nowrap overflow-hidden",
              isCollapsed 
                ? "w-10 mx-auto" 
                : "w-full gap-2 px-4"
            )}>
              <Plus className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="">NEW EVENT</span>}
            </button>
          </div>

          {/* Navigation Content */}
          <SidebarContent className="px-0 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title} >
                      <div className={cn(
                        "h-10 transition-all duration-200 relative w-full",
                        "flex items-center group backdrop-blur-sm cursor-pointer",
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-4',
                        item.isActive
                          ? "bg-green-nice/10 text-green-nice"
                          : "bg-[#ffffff]/2 text-sidebar-foreground/70 hover:bg-[#ffffff]/3 hover:text-sidebar-foreground"
                      )}>
                        <a href={item.url} title={isCollapsed ? item.title : undefined} className={cn(
                          "flex items-center",
                          isCollapsed ? 'w-full justify-center' : 'w-full gap-3'
                        )}>
                          <item.icon className="w-4 h-4 shrink-0" />
                          
                          {!isCollapsed && (
                            <span className="text-md font-medium font-space-grotesk uppercase">
                              {item.title}
                            </span>
                          )}
                        </a>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Profile Section */}
          <SidebarFooter className={cn(
            "p-4 border-t border-sidebar-border/50"
          )}>
            <div className={cn(
              "flex items-center gap-3 p-3 backdrop-blur-sm w-full overflow-hidden",
              "bg-[#ffffff]/2 hover:bg-[#ffffff]/3 transition-colors duration-200 cursor-pointer",
              isCollapsed ? 'justify-center' : ''
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg bg-green-nice/90 flex items-center justify-center flex-shrink-0",
                "text-white text-sm font-semibold"
              )} 
              title={isCollapsed ? 'Alex Mercer (Principal Designer)' : undefined}>
                AM
              </div>
              
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <span className="text-sm font-medium text-sidebar-foreground whitespace-nowrap truncate">
                    Alex Mercer
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap truncate">
                    Principal Designer
                  </span>
                </div>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
    )
}



