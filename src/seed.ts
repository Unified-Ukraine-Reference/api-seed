import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import type { IndexColumn, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';

import { Data } from '@unified-ukraine-reference/api-generator';

import { locations, locationTypes } from './db/schema';

const CHUNK_SIZE = 250;

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
const db = drizzle(pool);

const { categoryLocationData, katottgData } = await Data({
  token: process.env['GITHUB_TOKEN'],
  owner: process.env['GITHUB_OWNER'],
  repo: process.env['GITHUB_REPO'],
  tag: process.env['GITHUB_TAG'],
});

async function insertInChunks<TTable extends PgTable>(
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
    await db.insert(table).values(chunk).onConflictDoUpdate(onConflictConfig);
    console.log(`${i} lines have been recorded.`);
  }
}

async function seedLocationTypeStep(data: (typeof locationTypes.$inferInsert)[]): Promise<void> {
  console.log(`Seeding locations-types... Total: ${data.length}`);

  await insertInChunks(locationTypes, data, {
    target: locationTypes.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      level: sql`excluded.level`,
    },
  });

  console.log('Seeding locations-types done.');
}

async function seedLocationStep(data: (typeof locations.$inferInsert)[]): Promise<void> {
  console.log(`Seeding locations... Total: ${data.length}`);

  const withoutParent = data.map((row) => ({ ...row, parentCode: null }));

  console.log('Phase 1: inserting rows without parentCode...');
  await insertInChunks(locations, withoutParent, {
    target: locations.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      categoryCode: sql`excluded.category_code`,
    },
  });

  console.log('Phase 2: updating parentCode...');
  await insertInChunks(locations, data, {
    target: locations.code,
    set: {
      parentCode: sql`excluded.parent_code`,
    },
  });

  console.log('Seeding locations done.');
}

async function seed(): Promise<void> {
  console.log(`=== Seeding start (Chunk Size < ${CHUNK_SIZE} rows) ===`);

  await seedLocationTypeStep(categoryLocationData);
  await seedLocationStep(katottgData);

  console.log('=== Seeding finished successfully! ===');
  await pool.end();
}

void seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
