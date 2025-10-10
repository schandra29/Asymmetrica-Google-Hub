/**
 * PRISMA CLIENT SINGLETON
 *
 * This module exports a single, shared instance of the PrismaClient. This ensures
 * that the entire application uses the same database connection pool, which is a
 * critical performance and resource management best practice. It also simplifies
 * mocking the database for testing purposes.
 *
 * @file This file contains the shared Prisma client instance.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { PrismaClient } from '@prisma/client';

// Export a single instance of the Prisma client to be used across the app.
export const prisma = new PrismaClient();