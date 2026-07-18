import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
export const db = drizzle(pool);

export type DbClient = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
