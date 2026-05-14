import { Toaster } from "sonner";
import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({children}: {children: React.ReactNode}){
    return (
        <div className="h-screen w-screen flex">
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex-1 h-full">
                    <div className="flex flex-col h-full w-full flex-1">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
            {/* Single dashboard-scoped toaster — used for Google Calendar
                sync notifications across all activity/period mutations. */}
            <Toaster
                theme="dark"
                position="bottom-right"
                richColors
                closeButton
            />
        </div>
    )
}
