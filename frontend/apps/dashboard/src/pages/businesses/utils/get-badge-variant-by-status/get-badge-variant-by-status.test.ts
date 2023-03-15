import { BusinessStatus } from '@onefootprint/types';

import getBadgeVariantByStatus from './get-badge-variant-by-status';

describe('getBadgeVariantByStatus', () => {
  it('returns correct variant', () => {
    expect(getBadgeVariantByStatus(BusinessStatus.failed, false)).toEqual(
      'error',
    );
    expect(getBadgeVariantByStatus(BusinessStatus.verified, false)).toEqual(
      'success',
    );
    expect(getBadgeVariantByStatus(BusinessStatus.failed, true)).toEqual(
      'error',
    );
    expect(getBadgeVariantByStatus(BusinessStatus.verified, true)).toEqual(
      'warning',
    );
    expect(getBadgeVariantByStatus(BusinessStatus.incomplete, true)).toEqual(
      'warning',
    );
  });
});
