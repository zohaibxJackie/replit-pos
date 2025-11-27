import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';

import * as schema from '../../shared/schema.js';
import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
console.log(databaseUrl)

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

let db;

// Check if using Neon (cloud) or local PostgreSQL
const isNeonDatabase = databaseUrl.includes('neon.tech') || databaseUrl.includes('neon-');

if (isNeonDatabase) {
  // Use Neon serverless driver for cloud database
  console.log('Using Neon serverless database driver');
  const sql = neon(databaseUrl);
  db = drizzleNeon({ client: sql, schema });
} else {
  // Use standard pg driver for local PostgreSQL
  console.log('Using local PostgreSQL database driver');
  const pool = new pg.Pool({
    connectionString: databaseUrl,
  });
  db = drizzlePg({ client: pool, schema });
}

export { db };

export default db;
