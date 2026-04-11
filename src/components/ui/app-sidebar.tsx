"use client"

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
  SidebarMenuItem,
  SidebarSeparator
} from "./sidebar"
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  Mail,
  HelpCircle,
  LogOut 
} from "lucide-react"

export default function AppSidebar(){
    const navigationItems = [
      {
        title: "Dashboard",
        icon: Home,
        url: "/dashboard"
      },
      {
        title: "Analytics", 
        icon: BarChart3,
        url: "/dashboard/analytics"
      },
      {
        title: "Users",
        icon: Users,
        url: "/dashboard/users"
      },
      {
        title: "Documents",
        icon: FileText,
        url: "/dashboard/documents"
      },
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard/calendar"
      },
      {
        title: "Messages",
        icon: Mail,
        url: "/dashboard/messages"
      }
    ]

    const secondaryItems = [
      {
        title: "Settings",
        icon: Settings,
        url: "/dashboard/settings"
      },
      {
        title: "Help",
        icon: HelpCircle,
        url: "/dashboard/help"
      }
    ]

    return (
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Automi</span>
                  <span className="text-xs text-muted-foreground">Dashboard</span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <a href={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-neutral-800 border-neutral-800" />

                <SidebarGroup>
                  <SidebarGroupLabel>Account</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {secondaryItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <a href={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}



