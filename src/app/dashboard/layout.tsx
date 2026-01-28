import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <MobileNav />
                <Sidebar />
                <AuthGuard>
                    <main className="flex-1 flex flex-col overflow-hidden p-4 pt-20 md:p-6 md:pt-6 lg:p-8">
                        {children}
                    </main>
                </AuthGuard>
            </div>
        </SidebarProvider>
    );
}
