import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <MobileNav />
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-6 md:pt-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
