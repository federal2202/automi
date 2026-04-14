"use client"

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
  SidebarMenuItem,
  useSidebar
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
    const { toggleSidebar } = useSidebar()

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
        <Sidebar 
          collapsible="icon"
          className={cn(
            "bg-sidebar border-r border-sidebar-border",
            "transition-all duration-300 ease-in-out"
          )}>
          {/* Clean Header Section */}
          <SidebarHeader className="p-4 flex flex-row items-center justify-between border-b border-sidebar-border/50">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <Logo />
            </div>
            
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto"
            >
              <Menu className="w-4 h-4 group-data-[collapsible=icon]:block hidden" />
              <X className="w-4 h-4 group-data-[collapsible=icon]:hidden block" />
            </button>
          </SidebarHeader>

          {/* NEW EVENT Button */}
          <div className="pt-6 pb-2 px-4 group-data-[collapsible=icon]:px-0">
            <button className="font-space-grotesk font-bold flex items-center justify-center transition-all duration-200 bg-green-nice/50 text-white text-sm hover:bg-green-nice/90 hover:scale-[1.02] shadow-sm h-10 flex-nowrap whitespace-nowrap overflow-hidden w-full gap-2 px-4 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:px-0">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">NEW EVENT</span>
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
                        "px-3",
                        item.isActive
                          ? "bg-green-nice/10 text-green-nice"
                          : "bg-[#ffffff]/2 text-sidebar-foreground/70 hover:bg-[#ffffff]/3 hover:text-sidebar-foreground"
                      )}>
                        <a href={item.url} title={item.title} className="flex items-center w-full gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="text-md font-medium font-space-grotesk uppercase group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </a>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Profile Section */}
          <SidebarFooter className="p-4 border-t border-sidebar-border/50">
            <div className="flex items-center gap-3 p-3 backdrop-blur-sm w-full overflow-hidden bg-[#ffffff]/2 hover:bg-[#ffffff]/3 transition-colors duration-200 cursor-pointer group-data-[collapsible=icon]:justify-center">
              <div className="w-8 h-8 rounded-lg bg-green-nice/90 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold" title="Alex Mercer (Principal Designer)">
                AM
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground whitespace-nowrap truncate">
                  Alex Mercer
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap truncate">
                  Principal Designer
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
    )
}



