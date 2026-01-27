"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Wallet,
    Settings,
    LogOut,
    Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, disabled: true },
    { name: "Property Registry", href: "/dashboard/registry", icon: Building2, disabled: false },
    { name: "Facilities", href: "/dashboard/facilities", icon: Warehouse, disabled: true },
    { name: "Billing & Payments", href: "/dashboard/billing", icon: CreditCard, disabled: true },
    { name: "Expenses & Budget", href: "/dashboard/ledger", icon: Wallet, disabled: true },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <div className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-sidebar-bg">
            {/* Header */}
            <div className="p-6">
                <h1 className="text-xl font-bold text-brand flex items-center gap-2">
                    <span className="text-2xl">☁️</span> Dayung
                </h1>
                <p className="mt-1 text-xs text-gray-500 font-medium">Morning Mist Inc.</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.disabled ? "#" : item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
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
                    className={cn(
                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                >
                    <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Settings
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Logout
                </button>
            </div>
        </div>
    );
}

