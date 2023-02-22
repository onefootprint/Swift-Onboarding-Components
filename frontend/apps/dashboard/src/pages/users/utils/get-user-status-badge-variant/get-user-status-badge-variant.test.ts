import { UserStatus } from '@onefootprint/types';
import getUserStatusBadgeVariant from 'src/pages/users/utils/get-user-status-badge-variant';

describe('getUserStatusBadgeVariant', () => {
  it('returns correct variant', () => {
    expect(getUserStatusBadgeVariant(UserStatus.failed, false)).toEqual(
      'error',
    );
    expect(getUserStatusBadgeVariant(UserStatus.verified, false)).toEqual(
      'success',
    );
    expect(getUserStatusBadgeVariant(UserStatus.failed, true)).toEqual('error');
    expect(getUserStatusBadgeVariant(UserStatus.verified, true)).toEqual(
      'warning',
    );
    expect(getUserStatusBadgeVariant(UserStatus.vaultOnly, true)).toEqual(
      'neutral',
    );
    expect(getUserStatusBadgeVariant(UserStatus.incomplete, true)).toEqual(
      'neutral',
    );
  });
});
