import type { TenantBillingProfile } from '@onefootprint/types/src/api/get-tenants';

import type { BillingProfileFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

describe.skip('convertFormData', () => {
  it.each([
    {
      data: { kyc: '20' },
      bp: { kyc: '20' },
      x: { kyc: undefined },
    },
    {
      data: { kyc: '20' },
      bp: undefined,
      x: { kyc: '20' },
    },
    // Empty string is serialized as a null
    {
      data: { kyc: '' },
      bp: { kyc: '20' },
      x: { kyc: null },
    },
  ])('.', ({ data, bp, x }) => {
    expect(
      convertFormData(bp as unknown as TenantBillingProfile | undefined, data as unknown as BillingProfileFormData),
    ).toEqual(x);
  });
});
