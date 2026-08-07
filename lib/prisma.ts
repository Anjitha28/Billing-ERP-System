import { PrismaClient } from '@prisma/client';

let url = process.env.DATABASE_URL || '';
if (url.includes('pooler') && !url.includes('pgbouncer=true')) {
  url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
} else if (url.includes('pooler') && !url.includes('connection_limit=')) {
  url += '&connection_limit=1';
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ datasources: { db: { url } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
