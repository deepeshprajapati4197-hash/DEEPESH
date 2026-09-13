import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static poolInstance: Pool;

  constructor() {
    // 1. Define the pool configurations
    if (!PrismaService.poolInstance) {
      PrismaService.poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20, // Limits total connections
        idleTimeoutMillis: 10000, // Closes sleeping connections
        connectionTimeoutMillis: 5000, // Time limit to wait for a free slot
        maxUses: 7500, // Refreshes connection after X queries
      });
    }

    // 2. Wrap it inside the Prisma Postgres driver adapter
    const adapter = new PrismaPg(PrismaService.poolInstance);

    // 3. Pass the adapter to the parent PrismaClient class
    super({ adapter });
  }

  // Runs a test query on server boot to make sure the database is alive
  async onModuleInit() {
    await this.$queryRaw`SELECT 1`;
  }

  // Shuts down the pool when the NestJS server stops
  async onModuleDestroy() {
    if (PrismaService.poolInstance) {
      await PrismaService.poolInstance.end();
    }
  }
}
