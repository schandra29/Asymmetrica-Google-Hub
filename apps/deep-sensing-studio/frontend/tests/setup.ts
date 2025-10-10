// vitest-setup.ts
import '@testing-library/jest-dom';

// Mock ResizeObserver for Radix UI components in JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;