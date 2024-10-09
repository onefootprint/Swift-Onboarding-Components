import type { TenantVendorControl } from '@onefootprint/types/src/api/get-tenants';

import type { TenantVendorControlFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

describe('convertFormData', () => {
  it.each([
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '12345',
        middeskApiKey: '••••••',
        neuroEnabled: false,
        sentilinkCredentials: {
          account: '••••••',
          token: '••••••',
        },
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '12345',
        middeskApiKeyExists: true,
        neuroEnabled: false,
        sentilinkCredentialsExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: undefined,
        neuroEnabled: undefined,
        sentilinkCredentials: undefined,
      },
    },
    {
      data: {
        idologyEnabled: false,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '',
        neuroEnabled: false,
        sentilinkCredentials: {
          account: '',
          token: '',
        },
      },
      tvc: undefined,
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: undefined,
        neuroEnabled: undefined,
        sentilinkCredentials: undefined,
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '12345',
        middeskApiKey: '54321',
        neuroEnabled: true,
        sentilinkCredentials: {
          account: 'newAccount',
          token: 'newToken',
        },
      },
      tvc: undefined,
      x: {
        idologyEnabled: true,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: '12345',
        middeskApiKey: '54321',
        neuroEnabled: true,
        sentilinkCredentials: {
          account: 'newAccount',
          token: 'newToken',
        },
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '12345',
        neuroEnabled: true,
        sentilinkCredentials: {
          account: 'updatedAccount',
          token: '••••••',
        },
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: undefined,
        middeskApiKeyExists: true,
        neuroEnabled: false,
        sentilinkCredentialsExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: '12345',
        neuroEnabled: true,
        sentilinkCredentials: {
          account: 'updatedAccount',
          token: undefined,
        },
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '',
        neuroEnabled: false,
        sentilinkCredentials: {
          account: '',
          token: '',
        },
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: undefined,
        middeskApiKeyExists: true,
        neuroEnabled: true,
        sentilinkCredentialsExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: null,
        neuroEnabled: false,
        sentilinkCredentials: null,
      },
    },
  ])('.', ({ data, tvc, x }) => {
    expect(
      convertFormData(
        tvc as unknown as TenantVendorControl | undefined,
        data as unknown as TenantVendorControlFormData,
      ),
    ).toEqual(x);
  });
});
