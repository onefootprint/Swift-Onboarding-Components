import { mockRequest } from '@onefootprint/test-utils';
import { DataKind, DupeKind, type GetDuplicateDataResponse, IdDI } from '@onefootprint/types';
import { EntityStatus } from '@onefootprint/types/src/data';

const duplicateDataFixturePopulated: GetDuplicateDataResponse = {
  sameTenant: [
    {
      dupeKinds: [DupeKind.email, DupeKind.ssn9],
      fpId: 'fp_id_test',
      status: EntityStatus.pass,
      startTimestamp: '2024-10-30T16:38:20.506011Z',
      data: [
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
      ],
    },
    {
      dupeKinds: [DupeKind.phoneNumber],
      fpId: 'fp_id_test2',
      status: EntityStatus.failed,
      startTimestamp: '2023-11-30T16:38:20.506011Z',
      data: [
        {
          identifier: IdDI.lastName,
          source: 'hosted',
          isDecryptable: true,
          dataKind: DataKind.vaultData,
          value: null,
          transforms: {
            prefix_1: 'T',
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
          value: 'John',
          transforms: {},
        },
      ],
    },
  ],
  otherTenant: {
    numMatches: 20,
    numTenants: 10,
  },
};

const duplicateDataFixtureEmpty: GetDuplicateDataResponse = {
  sameTenant: [],
  otherTenant: {
    numMatches: 20,
    numTenants: 10,
  },
};

export const withDuplicateDataPopulated = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/dupes',
    response: duplicateDataFixturePopulated,
  });

export const withDuplicateDataEmpty = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/dupes',
    response: duplicateDataFixtureEmpty,
  });

export const withDuplicateDataError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/dupes',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
