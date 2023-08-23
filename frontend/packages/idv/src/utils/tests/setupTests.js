import 'jest-canvas-mock';

Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
