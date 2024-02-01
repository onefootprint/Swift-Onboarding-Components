import { describe, expect, it } from 'bun:test';

import isDomainAllowed from './verify-allowed-domain';

describe('isDomainAllowed', () => {
  it.each([
    {
      url: 'http://localhost:3002/route?param=1',
      list: ['https://localhost:3002'],
      x: true,
    },
    { url: 'onefootprint.com', list: ['www.onefootprint.com'], x: true },
    {
      url: 'onefootprint.com',
      list: ['https://www.onefootprint.com'],
      x: true,
    },
    { url: 'www.onefootprint.com', list: ['www.onefootprint.com'], x: true },
    {
      url: 'http://www.onefootprint.com/a/b',
      list: ['www.onefootprint.com'],
      x: true,
    },
    {
      url: 'https://www.onefootprint.com',
      list: ['www.onefootprint.com'],
      x: true,
    },
    {
      url: 'https://www.onefootprint.com',
      list: ['onefootprint.com'],
      x: true,
    },
    { url: '', list: ['www.onefootprint.com'], x: false },
    { url: 'not-adomain', list: ['www.onefootprint.com'], x: false },
  ])('.', ({ url, list, x }) => {
    expect(isDomainAllowed(url, list)).toBe(x);
  });
});
