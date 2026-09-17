'use client';

import { useRouter } from 'next/navigation';
import AgentChat from './AgentChat';

export default function AgentChatWrapper() {
  const router = useRouter();

  const handleModuleUnlock = () => {
    // Refresh the layout to pick up new visible modules
    router.refresh();
  };

  return <AgentChat onModuleUnlock={handleModuleUnlock} />;
}
