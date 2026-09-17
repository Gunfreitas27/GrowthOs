import { db, workspaces, businessContext, brandContext } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Idempotent: the app/(app)/* pages hardcode a DEMO_WORKSPACE_ID string that
// is NOT a valid uuid (workspace_id columns are uuid), so it can never match
// a real row. This script gets/creates a real workspace by slug and prints
// its uuid, for use as `workspaceId` when testing the MCP tools by hand.
const DEMO_SLUG = 'demo';

async function main() {
  let workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, DEMO_SLUG),
  });

  if (!workspace) {
    const [created] = await db
      .insert(workspaces)
      .values({ name: 'GrowthOS Demo', slug: DEMO_SLUG })
      .returning();
    workspace = created;
    console.error(`[seed] created workspace ${workspace.id}`);
  } else {
    console.error(`[seed] workspace already exists: ${workspace.id}`);
  }

  const workspaceId = workspace.id;

  const existingBusiness = await db.query.businessContext.findFirst({
    where: eq(businessContext.workspaceId, workspaceId),
  });
  if (!existingBusiness) {
    await db.insert(businessContext).values({
      workspaceId,
      data: {
        segment: 'B2B SaaS — martech para PMEs brasileiras',
        stage: 'early',
        website: 'https://example.com',
        icp: { titulo: 'Head de Marketing', empresa: 'PME B2B, 20-200 funcionários' },
        channels: ['organic', 'paid_search', 'outbound'],
        competitors: ['RD Station', 'Groway360'],
        objectives: ['Aumentar MQLs qualificados em 30%'],
      },
    });
    console.error('[seed] seeded business_context');
  }

  const existingBrand = await db.query.brandContext.findFirst({
    where: eq(brandContext.workspaceId, workspaceId),
  });
  if (!existingBrand) {
    await db.insert(brandContext).values({
      workspaceId,
      data: { brief: 'Marca ainda em definição — seed mínimo para teste do MCP server.' },
    });
    console.error('[seed] seeded brand_context');
  }

  console.log(workspaceId);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
