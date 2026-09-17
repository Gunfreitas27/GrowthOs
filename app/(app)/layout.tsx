import Sidebar from '@/components/layout/Sidebar';
import AgentChatWrapper from '@/components/layout/AgentChatWrapper';
import { resolveVisibleModules } from '@/lib/mock/resolver';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import { auth, signOut } from '@/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const workspaceId = await getCurrentWorkspaceId();
  const visibleModules = await resolveVisibleModules(workspaceId);
  const session = process.env.USE_MOCK_DATA === 'true' ? null : await auth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        visibleModules={visibleModules}
        userEmail={session?.user?.email}
        signOutAction={
          session
            ? async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }
            : undefined
        }
      />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <AgentChatWrapper />
    </div>
  );
}
