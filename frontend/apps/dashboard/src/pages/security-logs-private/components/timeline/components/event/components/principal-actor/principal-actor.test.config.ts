import type { AccessEvent } from '@onefootprint/types';

export const principalWithNameFixture: AccessEvent['principal'] = {
  kind: 'user',
  id: '123',
  name: 'John Doe',
};

export const principalWithoutNameFixture: AccessEvent['principal'] = {
  kind: 'user',
  id: '456',
};
