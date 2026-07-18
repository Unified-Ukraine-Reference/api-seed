import 'dotenv/config';

import { sql } from 'drizzle-orm';

import type { IndexColumn, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';

import { Data } from '@unified-ukraine-reference/api-generator';

import { schema, db, pool } from './db';

import type { DbClient } from './db/client';

const CHUNK_SIZE = 250;

const { locationTypes, locations } = schema;

async function insertInChunks<TTable extends PgTable>(
  tx: DbClient,
  table: TTable,
  data: TTable['$inferInsert'][],
  onConflictConfig: {
    target: IndexColumn | IndexColumn[];
    set: PgUpdateSetSource<TTable>;
  }
): Promise<void> {
  if (!data || data.length === 0) {
    console.log('No data to seed.');
    return;
  }

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await tx.insert(table).values(chunk).onConflictDoUpdate(onConflictConfig);
    console.log(`${i} lines have been recorded.`);
  }
}

async function seedLocationTypeStep(
  tx: DbClient,
  data: (typeof locationTypes.$inferInsert)[]
): Promise<void> {
  console.log(`Seeding locations-types... Total: ${data.length}`);

  await insertInChunks(tx, locationTypes, data, {
    target: locationTypes.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      level: sql`excluded.level`,
    },
  });

  console.log('Seeding locations-types done.');
}

async function seedLocationStep(
  tx: DbClient,
  data: (typeof locations.$inferInsert)[]
): Promise<void> {
  console.log(`Seeding locations... Total: ${data.length}`);

  const withoutParent = data.map((row) => ({ ...row, parentCode: null }));

  console.log('Phase 1: inserting rows without parentCode...');
  await insertInChunks(tx, locations, withoutParent, {
    target: locations.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      categoryCode: sql`excluded.category_code`,
    },
  });

  console.log('Phase 2: updating parentCode...');
  await insertInChunks(tx, locations, data, {
    target: locations.code,
    set: {
      parentCode: sql`excluded.parent_code`,
    },
  });

  console.log('Seeding locations done.');
}

async function seed(): Promise<void> {
  console.log(`=== Seeding start (Chunk Size < ${CHUNK_SIZE} rows) ===`);

  try {
    const { categoryLocationData, katottgData } = await Data({
      token: process.env['GITHUB_TOKEN'],
      owner: process.env['GITHUB_OWNER'],
      repo: process.env['GITHUB_REPO'],
      tag: process.env['GITHUB_TAG'],
    });

    await db.transaction(async (tx) => {
      await seedLocationTypeStep(tx, categoryLocationData);
      await seedLocationStep(tx, katottgData);
    });

    console.log('=== Seeding finished successfully! ===');
  } finally {
    await pool.end();
  }
}

void seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
