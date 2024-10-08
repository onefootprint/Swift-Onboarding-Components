import { DataKind, type DuplicateDataItem, EntityStatus, IdDI } from '@onefootprint/types';

export const mockDupe: DuplicateDataItem = {
  fpId: 'fp_id_test_XwtUmiamP9k1JLmBZJM2ag',
  startTimestamp: '2023-05-15T10:30:00Z',
  dupeKinds: [],
  status: EntityStatus.pending, // Add this line
  data: [
    {
      identifier: IdDI.firstName,
      value: 'John',
      source: 'source',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      transforms: {},
    },
    {
      identifier: IdDI.lastName,
      value: null,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      transforms: {
        prefix_1: 'D',
      },
    },
  ],
};
