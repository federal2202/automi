"use client"

import Logo from "../shared/Logo"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "./sidebar"
import { 
  Calendar,
  CheckSquare,
  BarChart3,
  ChevronRight
} from "lucide-react"

export default function AppSidebar(){
    const navigationItems = [
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard/calendar"
      },
      {
        title: "Tasks", 
        icon: CheckSquare,
        url: "/dashboard/tasks"
      },
      {
        title: "Overview",
        icon: BarChart3,
        url: "/dashboard/overview"
      }
    ]

    return (
        <Sidebar className="border-r border-gray-200">
            <SidebarHeader className="p-4 outline-none ring-0 ">
              <Logo />
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-3">
                    Platform
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild className="h-9 px-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 flex items-center justify-between group">
                            <a href={item.url}>
                              <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.title}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                  S
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-900 truncate">shadcn</span>
                  <span className="text-xs text-gray-500 truncate">m@example.com</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </SidebarFooter>
        </Sidebar>
    )
}



