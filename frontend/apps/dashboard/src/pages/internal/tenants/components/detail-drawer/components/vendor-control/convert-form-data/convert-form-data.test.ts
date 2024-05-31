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
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '12345',
        middeskApiKeyExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: undefined,
      },
    },
    {
      data: {
        idologyEnabled: false,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '',
      },
      tvc: undefined,
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        middeskApiKey: undefined,
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '12345',
        middeskApiKey: '54321',
      },
      tvc: undefined,
      x: {
        idologyEnabled: true,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: '12345',
        middeskApiKey: '54321',
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '12345',
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: undefined,
        middeskApiKeyExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        // API key updated
        middeskApiKey: '12345',
      },
    },
    {
      data: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: '',
        middeskApiKey: '',
      },
      tvc: {
        idologyEnabled: true,
        experianEnabled: false,
        lexisEnabled: false,
        experianSubscriberCode: undefined,
        middeskApiKeyExists: true,
      },
      x: {
        idologyEnabled: undefined,
        experianEnabled: undefined,
        lexisEnabled: undefined,
        experianSubscriberCode: undefined,
        // API key cleared out
        middeskApiKey: null,
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
