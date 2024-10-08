import { type DataIdentifier, DataKind, DupeKind, type DuplicateDataItem, EntityStatus } from '@onefootprint/types';

// All of the dupe fingerprints are the same - all are relevant dupes
const allMatchingDupesFixture: DuplicateDataItem[] = [
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_1',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.WF.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint1',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_2',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Bofa.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint1',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_3',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Chase.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint1',
        transforms: {},
      },
    ],
  },
];

// Some of the dupe fingerprints are the same - some are relevant dupes
const mixedDupesFixture: DuplicateDataItem[] = [
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_1',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.WF.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint1',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_2',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Bofa.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint1',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_3',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Chase.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint2',
        transforms: {},
      },
    ],
  },
];

// None of the dupe fingerprints are the same - some are relevant dupes
const nonMatchingDupesFixture: DuplicateDataItem[] = [
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_1',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.WF.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint2',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_2',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Bofa.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint3',
        transforms: {},
      },
    ],
  },
  {
    dupeKinds: [DupeKind.bankRoutingAccount],
    fpId: 'fp_id_3',
    status: EntityStatus.pass,
    startTimestamp: '2024-10-05T00:09:46.854697Z',
    data: [
      {
        identifier: 'bank.Chase.fingerprint' as DataIdentifier,
        source: 'tenant',
        isDecryptable: true,
        dataKind: DataKind.vaultData,
        value: 'fingerprint4',
        transforms: {},
      },
    ],
  },
];

export { allMatchingDupesFixture, mixedDupesFixture, nonMatchingDupesFixture };
