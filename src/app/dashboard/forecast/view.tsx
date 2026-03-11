'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { MetricCategory } from "@/types/enums";
import { ForecastParameters, ForecastResult, calculateForecast } from "@/lib/forecast";
import { getDashboardMetrics, saveScenario } from "../actions";

export default function ForecastView() {
    const [baseline, setBaseline] = useState<Record<MetricCategory, number> | null>(null);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState<ForecastParameters>({
        acquisitionUplift: 0,
        activationUplift: 0,
        retentionUplift: 0,
        referralUplift: 0,
        revenueUplift: 0,
    });
    const [forecastData, setForecastData] = useState<ForecastResult[]>([]);
    const [scenarioName, setScenarioName] = useState("New Scenario");

    useEffect(() => {
        getDashboardMetrics().then(data => {
            const base: Record<MetricCategory, number> = {
                [MetricCategory.ACQUISITION]: data.acquisition.value,
                [MetricCategory.ACTIVATION]: data.activation.value, // Note: simplifying for MVP
                [MetricCategory.RETENTION]: data.retention.value,
                [MetricCategory.REFERRAL]: data.referral.value,
                [MetricCategory.REVENUE]: data.revenue.value,
            };
            setBaseline(base);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (baseline) {
            const data = calculateForecast(baseline, params);
            setForecastData(data);
        }
    }, [baseline, params]);

    const handleSave = async () => {
        try {
            await saveScenario(scenarioName, "Simulated scenario", params);
            alert("Scenario saved successfully!");
        } catch (e) {
            alert("Failed to save scenario");
        }
    };

    if (loading) return <div>Loading forecast tools...</div>;

    const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

    return (
        <div className="grid gap-6 md:grid-cols-12">
            {/* Controls Sidebar */}
            <Card className="md:col-span-4">
                <CardHeader>
                    <CardTitle>Simulation Parameters</CardTitle>
                    <CardDescription>Adjust uplifts to see projected impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <UpliftControl
                        label="Acquisition Uplift"
                        value={params.acquisitionUplift}
                        onChange={(v) => setParams({ ...params, acquisitionUplift: v })}
                    />
                    <UpliftControl
                        label="Activation Uplift"
                        value={params.activationUplift}
                        onChange={(v) => setParams({ ...params, activationUplift: v })}
                    />
                    <UpliftControl
                        label="Retention Uplift"
                        value={params.retentionUplift}
                        onChange={(v) => setParams({ ...params, retentionUplift: v })}
                    />
                    <UpliftControl
                        label="Referral Uplift"
                        value={params.referralUplift}
                        onChange={(v) => setParams({ ...params, referralUplift: v })}
                    />
                    <UpliftControl
                        label="Revenue Uplift"
                        value={params.revenueUplift}
                        onChange={(v) => setParams({ ...params, revenueUplift: v })}
                    />

                    <Separator className="my-4" />

                    <div className="space-y-4">
                        <input
                            className="w-full p-2 border rounded text-sm"
                            value={scenarioName}
                            onChange={(e) => setScenarioName(e.target.value)}
                            placeholder="Scenario name..."
                        />
                        <Button className="w-full" onClick={handleSave}>Save Scenario</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Projection Chart */}
            <Card className="md:col-span-8">
                <CardHeader>
                    <CardTitle>Revenue Forecast (12 Months)</CardTitle>
                    <CardDescription>Projected monthly revenue based on combined uplifts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecastData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                                <YAxis tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                <Line
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke="#adfa1d"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UpliftControl({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
                <span>{label}</span>
                <span className="text-green-500">+{Math.round(value * 100)}%</span>
            </div>
            <Slider
                value={[value * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(vals) => onChange(vals[0] / 100)}
            />
        </div>
    );
}
