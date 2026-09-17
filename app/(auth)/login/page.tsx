import { signIn } from '@/auth';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-border bg-card">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-xl font-semibold">Flywell</h1>
          <p className="text-sm text-muted-foreground mt-1">Growth Orchestrator Platform</p>
        </div>

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/overview' });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-border bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Entrar com Google
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Primeiro acesso? Um workspace é criado automaticamente para você.
        </p>
      </div>
    </div>
  );
}
