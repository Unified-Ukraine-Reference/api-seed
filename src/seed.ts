import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { sql, Table } from "drizzle-orm";
import { Pool } from "pg";

import type { PgInsertOnConflictDoUpdateConfig } from "drizzle-orm/pg-core";

import { locations, locationTypes } from "./db/schema";
import { LT, K, O, P, H, MXC, B } from "./seeds";

const CHUNK_SIZE = 250;

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const db = drizzle(pool);

async function insertInChunks<TTable extends Table>(
  table: TTable,
  data: TTable["$inferInsert"][],
  onConflictConfig: PgInsertOnConflictDoUpdateConfig<any>
): Promise<void> {
  if (!data || data.length === 0) return;

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    await db.insert(table).values(chunk).onConflictDoUpdate(onConflictConfig);
    console.log(`${i} lines have been recorded.`);
  }
}

async function seedLocationTypeStep(
  data: (typeof locationTypes.$inferInsert)[]
): Promise<void> {
  if (!data || data.length === 0) return;

  console.log(`Seeding locations-types... Total: ${LT.length}`);

  await insertInChunks(locationTypes, data, {
    target: locationTypes.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      level: sql`excluded.level`
    }
  });

  console.log("Seeding locations-types done.");
}

async function seedLocationStep(
  stepName: string,
  data: (typeof locations.$inferInsert)[]
): Promise<void> {
  if (!data || data.length === 0) return;

  console.log(`Seeding locations[${stepName}]... Total: ${data.length}`);

  await insertInChunks(locations, data, {
    target: locations.code,
    set: {
      nameUa: sql`excluded.name_ua`,
      nameEn: sql`excluded.name_en`,
      categoryCode: sql`excluded.category_code`,
      parentCode: sql`excluded.parent_code`
    }
  });

  console.log(`Seeding locations[${stepName}] done.`);
}

async function seed(): Promise<void> {
  console.log(`=== Seeding start (Chunk Size < ${CHUNK_SIZE} rows) ===`);

  await seedLocationTypeStep(LT);
  await seedLocationStep("K", K);
  await seedLocationStep("O", O);
  await seedLocationStep("P", P);
  await seedLocationStep("H", H);
  await seedLocationStep("MXC", MXC);
  await seedLocationStep("B", B);

  console.log("=== Seeding finished successfully! ===");
  await pool.end();
}

void seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
