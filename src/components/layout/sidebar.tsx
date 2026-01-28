"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeft, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "./sidebar-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Navigation items with custom icon paths
const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "/icons/dashboard.svg", disabled: true },
    { name: "Property Registry", href: "/dashboard/registry", icon: "/icons/house.svg", disabled: false },
    { name: "Facilities", href: "/dashboard/facilities", icon: null, lucideIcon: Warehouse, disabled: true },
    { name: "Billing & Payments", href: "/dashboard/billing", icon: "/icons/payment.svg", disabled: true },
    { name: "Expenses & Budget", href: "/dashboard/ledger", icon: "/icons/wallet.svg", disabled: true },
];

interface NavIconProps {
    iconPath?: string | null;
    LucideIcon?: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    className?: string;
}

function NavIcon({ iconPath, LucideIcon, isActive, className }: NavIconProps) {
    if (iconPath) {
        return (
            <Image
                src={iconPath}
                alt=""
                width={20}
                height={20}
                className={cn(
                    "flex-shrink-0 transition-opacity",
                    isActive ? "opacity-100" : "opacity-60 group-hover:opacity-80",
                    className
                )}
            />
        );
    }
    if (LucideIcon) {
        return (
            <LucideIcon
                className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-brand" : "text-gray-400 group-hover:text-gray-500",
                    className
                )}
            />
        );
    }
    return null;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const { isCollapsed, toggleSidebar } = useSidebar();

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    "hidden md:flex h-screen flex-col border-r border-border bg-sidebar-bg transition-all duration-300",
                    isCollapsed ? "w-16" : "w-56"
                )}
            >
                {/* Header with Logo */}
                <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                    <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
                        <Image
                            src="/logo/dayung-logo.svg"
                            alt="Dayung"
                            width={28}
                            height={34}
                            className="flex-shrink-0"
                        />
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-lg font-bold text-brand">Dayung</h1>
                                <p className="text-xs text-gray-500 font-medium">Morning Mist Inc.</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <div className="px-3 pb-2">
                        <button
                            onClick={toggleSidebar}
                            className="w-full p-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex justify-center"
                            aria-label="Expand sidebar"
                        >
                            <PanelLeft className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const navItem = (
                            <Link
                                key={item.name}
                                href={item.disabled ? "#" : item.href}
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-brand"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    item.disabled && "opacity-50 pointer-events-none",
                                    isCollapsed && "justify-center px-2"
                                )}
                                aria-disabled={item.disabled}
                            >
                                <NavIcon
                                    iconPath={item.icon}
                                    LucideIcon={item.lucideIcon}
                                    isActive={isActive}
                                    className={isCollapsed ? "" : "mr-3"}
                                />
                                {!isCollapsed && item.name}
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.name}>
                                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>
                                        {item.name}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return navItem;
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="border-t border-border p-3 space-y-1">
                    {/* Settings */}
                    {(() => {
                        const settingsLink = (
                            <Link
                                href="/dashboard/settings"
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <Image
                                    src="/icons/settings.svg"
                                    alt=""
                                    width={20}
                                    height={20}
                                    className={cn("flex-shrink-0 opacity-60 group-hover:opacity-80", !isCollapsed && "mr-3")}
                                />
                                {!isCollapsed && "Settings"}
                            </Link>
                        );
                        if (isCollapsed) {
                            return (
                                <Tooltip>
                                    <TooltipTrigger asChild>{settingsLink}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>
                                        Settings
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return settingsLink;
                    })()}

                    {/* Logout */}
                    {(() => {
                        const logoutBtn = (
                            <button
                                onClick={handleLogout}
                                className={cn(
                                    "w-full flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <LogOut className={cn("h-5 w-5 text-gray-400 group-hover:text-gray-500", !isCollapsed && "mr-3")} />
                                {!isCollapsed && "Logout"}
                            </button>
                        );
                        if (isCollapsed) {
                            return (
                                <Tooltip>
                                    <TooltipTrigger asChild>{logoutBtn}</TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>
                                        Logout
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return logoutBtn;
                    })()}
                </div>
            </div>
        </TooltipProvider>
    );
}
