import { Toaster } from "sonner";
import AppSidebar from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import Logo from "@/components/shared/Logo";

export default function DashboardLayout({children}: {children: React.ReactNode}){
    return (
        <div className="h-screen w-screen flex">
            <OnboardingGuard />
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex-1 h-full">
                    <div className="flex flex-col h-full w-full flex-1">
                        <div className="md:hidden h-14 flex items-center gap-2 px-4 border-b border-sidebar-border/50 shrink-0">
                            <SidebarTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
                            <Logo />
                        </div>
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
