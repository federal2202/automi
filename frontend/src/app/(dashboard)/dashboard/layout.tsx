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
                        <header className="md:hidden sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border/50 bg-[#0e0e0e]/90 px-4 backdrop-blur-md">
                            <SidebarTrigger className="h-9 w-9 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent [&_svg]:size-[18px]" />
                            <div className="h-5 w-px bg-sidebar-border/50" />
                            <Logo />
                        </header>
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
