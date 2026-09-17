import { auth } from '@/auth';

// The single place every server component/route asks "which workspace is
// this request for" — resolved from the real session now that Google OAuth
// login exists (auth.ts), except in mock mode, which never touches a real
// DB and has no session to resolve.
const FALLBACK_MOCK_WORKSPACE_ID = 'mock-workspace-id';

export async function getCurrentWorkspaceId(): Promise<string> {
  if (process.env.USE_MOCK_DATA === 'true') return FALLBACK_MOCK_WORKSPACE_ID;

  const session = await auth();
  const workspaceId = session?.user?.workspaceId;
  if (!workspaceId) {
    throw new Error(
      'Sem sessão autenticada — esta função só deve ser chamada em rotas protegidas pelo middleware.'
    );
  }
  return workspaceId;
}
