import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--velox-void)' }}>
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
                {children}
            </main>
        </div>
    );
}
