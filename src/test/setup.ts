import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Make beforeEach available globally
(globalThis as any).beforeEach = beforeEach;

// Setup global mocks for browser APIs
Object.defineProperty(globalThis, 'global', {
  value: globalThis,
  writable: true,
});

// Mock fetch globally
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true,
});

// Mock URL globally
Object.defineProperty(globalThis, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});