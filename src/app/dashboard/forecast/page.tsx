import ForecastView from "./view";

export const metadata = {
    title: "Forecast & Scenarios | Growth OS",
    description: "Simulate growth scenarios and project revenue impact.",
};

export default function ForecastPage() {
    return (
        <div className="flex-col md:flex">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Forecast & Scenarios</h2>
                </div>
                <ForecastView />
            </div>
        </div>
    );
}
