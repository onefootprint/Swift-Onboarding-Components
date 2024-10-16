import { EntityStatus } from '@onefootprint/types';

import getBadgeVariantByStatus from './get-badge-variant-by-status';

describe('getBadgeVariantByStatus', () => {
  it('returns correct variant', () => {
    expect(getBadgeVariantByStatus(EntityStatus.failed, false)).toEqual('error');
    expect(getBadgeVariantByStatus(EntityStatus.pass, false)).toEqual('success');
    expect(getBadgeVariantByStatus(EntityStatus.failed, true)).toEqual('error');
    expect(getBadgeVariantByStatus(EntityStatus.pass, true)).toEqual('warning');
    expect(getBadgeVariantByStatus(EntityStatus.incomplete, true)).toEqual('warning');
  });
});
