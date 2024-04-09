import { DataKind, IdDI } from '@onefootprint/types';
import type { Attribute } from '@onefootprint/types/src/data/entity';

export const attributesWithFnAndLnInitial: Attribute[] = [
  {
    identifier: IdDI.lastName,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {
      prefix_1: 'D',
    },
  },
  {
    identifier: IdDI.city,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
  {
    identifier: IdDI.firstName,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: 'Jane',
    transforms: {},
  },
];

export const attributesWithOnlyLnInitial: Attribute[] = [
  {
    identifier: IdDI.lastName,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {
      prefix_1: 'D',
    },
  },
  {
    identifier: IdDI.city,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
];

export const attributesWithOnlyFn: Attribute[] = [
  {
    identifier: IdDI.city,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
  {
    identifier: IdDI.firstName,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: 'Jane',
    transforms: {},
  },
];

export const attributesWithFnEncrypted: Attribute[] = [
  {
    identifier: IdDI.city,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
  {
    identifier: IdDI.firstName,
    source: 'hosted',
    isDecryptable: false,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
  {
    identifier: IdDI.lastName,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {
      prefix_1: 'D',
    },
  },
];

export const attributesWithNoName: Attribute[] = [
  {
    identifier: IdDI.city,
    source: 'hosted',
    isDecryptable: true,
    dataKind: DataKind.vaultData,
    value: null,
    transforms: {},
  },
];
