import { AccessEventKind } from '@onefootprint/types';

export const decryptUserDataFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    fpId: '123',
    reason: 'Test reason',
    decryptedFields: [],
  },
};
