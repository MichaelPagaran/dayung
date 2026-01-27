"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Menu,
    X,
    LayoutDashboard,
    Building2,
    CreditCard,
    Wallet,
    Settings,
    LogOut,
    Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, disabled: true },
    { name: "Property Registry", href: "/dashboard/registry", icon: Building2, disabled: false },
    { name: "Facilities", href: "/dashboard/facilities", icon: Warehouse, disabled: true },
    { name: "Billing & Payments", href: "/dashboard/billing", icon: CreditCard, disabled: true },
    { name: "Expenses & Budget", href: "/dashboard/ledger", icon: Wallet, disabled: true },
];

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-white p-4 md:hidden">
                <h1 className="text-lg font-bold text-brand flex items-center gap-2">
                    <span className="text-xl">☁️</span> Dayung
                </h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Navigation Drawer */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="fixed left-0 top-0 h-full w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:rounded-none">
                    <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border p-4">
                        <h2 className="text-lg font-bold text-brand flex items-center gap-2">
                            <span className="text-xl">☁️</span> Dayung
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            aria-label="Close navigation menu"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <p className="px-4 text-xs text-gray-500 font-medium">Morning Mist Inc.</p>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.disabled ? "#" : item.href}
                                    onClick={() => !item.disabled && setOpen(false)}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary-50 text-brand"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        item.disabled && "opacity-50 pointer-events-none"
                                    )}
                                    aria-disabled={item.disabled}
                                >
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-brand" : "text-gray-400 group-hover:text-gray-500"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="border-t border-border p-3 space-y-1">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setOpen(false)}
                            className="group flex items-center rounded-md px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center rounded-md px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                            Logout
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

