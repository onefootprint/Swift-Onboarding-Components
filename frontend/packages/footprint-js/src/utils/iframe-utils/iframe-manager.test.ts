import { describe, expect, it } from 'bun:test';

import initIframeManager, { getIframeKey } from './iframe-manager';

type Props = Parameters<typeof getIframeKey>[0];

describe('getIframeKey', () => {
  it('should generate a string version of properties', () => {
    const result = getIframeKey({ kind: 'verify' } as unknown as Props);
    expect(result).toEqual('{"kind":"verify","variant":"modal"}');
  });
});

describe('initIframeManager', () => {
  it('should return the correct instance', () => {
    const iFrameManager = initIframeManager();

    expect(iFrameManager).toMatchObject({
      getOrCreate: expect.any(Function),
      getOrCreateSecondary: expect.any(Function),
      remove: expect.any(Function),
      removeSecondary: expect.any(Function),
    });
  });
});
