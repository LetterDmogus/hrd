import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';

export default fp(async (fastify) => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password_kamu@postgres:5432/hrd_analytics_db';
  
  // Client postgres-js
  const client = postgres(connectionString);
  
  // Inisialisasi Drizzle ORM
  const db = drizzle(client, { schema });

  // Decorate fastify agar fastify.db bisa dipanggil di seluruh route
  fastify.decorate('db', db);
});
