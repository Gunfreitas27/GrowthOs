'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "./actions";

export default function DashboardView() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardMetrics().then(data => {
            setMetrics(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Acquisition" value={metrics.acquisition.value} trend={metrics.acquisition.trend} />
                <KpiCard title="Activation" value={metrics.activation.value} unit={metrics.activation.unit} trend={metrics.activation.trend} />
                <KpiCard title="Retention" value={metrics.retention.value} unit={metrics.retention.unit} trend={metrics.retention.trend} />
                <KpiCard title="Referral" value={metrics.referral.value} unit={metrics.referral.unit} trend={metrics.referral.trend} />
                <KpiCard title="Revenue" value={metrics.revenue.value} unit={metrics.revenue.unit} trend={metrics.revenue.trend} />
            </div>

            {/* Main Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={metrics.funnelData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

function KpiCard({ title, value, unit = "", trend }: any) {
    const isPositive = trend >= 0;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{unit === "USD" ? "$" : ""}{value.toLocaleString()}{unit !== "USD" ? unit : ""}</div>
                <p className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{trend}% from last month
                </p>
            </CardContent>
        </Card>
    )
}
