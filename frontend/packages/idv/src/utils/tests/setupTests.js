import 'jest-canvas-mock';

Object.defineProperty(window, 'scrollTo', {
  value: () => undefined,
  writable: true,
});
