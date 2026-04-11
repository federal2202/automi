import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({children}: {children: React.ReactNode}){
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                    <SidebarTrigger className="-ml-1" />
                    
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}