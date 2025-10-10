/**
 * SHARED PRISMA MOCK
 *
 * This file exports a mock Prisma client object that can be shared between
 * the Jest setup file and the individual test suites. This allows the tests
 * to manipulate the same mock instance that is being used to replace the
 * real Prisma client.
 *
 * @file This file contains the shared mock Prisma client.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { jest } from '@jest/globals';

export const mockPrisma = {
  document: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(async (fns) => {
    const results = [];
    for (const fn of fns) {
        results.push(await fn);
    }
    return results;
  }),
};