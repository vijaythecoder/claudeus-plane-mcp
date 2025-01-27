import { expect } from 'vitest';
import { MCPTestHarness } from '@/test/mcp-test-harness.js';

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidJsonRpc(): void;
  }
}

// Add custom matchers
expect.extend({
  toBeValidJsonRpc(received) {
    const pass = received &&
      typeof received === 'object' &&
      received.jsonrpc === '2.0' &&
      (typeof received.id === 'number' || typeof received.id === 'string' || received.id === undefined) &&
      (typeof received.method === 'string' || received.method === undefined) &&
      (typeof received.params === 'object' || received.params === undefined) &&
      (typeof received.result === 'object' || received.result === undefined) &&
      (typeof received.error === 'object' || received.error === undefined);

    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be a valid JSON-RPC message`,
      pass,
    };
  },
});

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test teardown
afterAll(() => {
  // Add any global cleanup here
});

// Make test utilities available globally
declare global {
  var testHarness: MCPTestHarness;
}

globalThis.testHarness = new MCPTestHarness(); 