import { notFound } from 'next/navigation';
import { LOCKED_MODULE_META } from '@/lib/modules/config';
import { LockedModulePreview } from '@/components/modules/LockedModulePreview';
import { resolveVisibleModules } from '@/lib/mock/resolver';
import { getCurrentWorkspaceId } from '@/lib/workspace/current';
import type { ModuleKey } from '@/lib/agents/types';

export default async function LockedModulePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const meta = LOCKED_MODULE_META[key as ModuleKey];
  if (!meta) notFound();

  const workspaceId = await getCurrentWorkspaceId();
  const visibleModules = await resolveVisibleModules(workspaceId);
  const unlocked = visibleModules.some((m) => m.moduleKey === key && m.status !== 'hidden');

  return <LockedModulePreview {...meta} unlocked={unlocked} />;
}
