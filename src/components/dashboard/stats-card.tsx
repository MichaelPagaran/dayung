import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: string; // e.g. "+12% from last month"
}

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
    return (
        <Card className="flex-1 min-w-[200px]">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <h4 className="mt-2 text-2xl font-bold text-gray-900">{value}</h4>
                </div>
                {Icon && (
                    <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
