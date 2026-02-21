import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DiagnosisView from "./view";

export default async function DiagnosisPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (!session.user.organizationId) {
        redirect("/onboarding");
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Funnel Diagnosis</h1>
                <p className="text-gray-500 mt-2">Automated bottleneck detection and recommendations</p>
            </div>
            <DiagnosisView />
        </div>
    );
}
