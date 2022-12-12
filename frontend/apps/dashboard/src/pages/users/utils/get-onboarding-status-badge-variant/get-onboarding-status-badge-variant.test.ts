import { OnboardingStatus } from '@onefootprint/types';
import getOnboardingStatusBadgeVariant from 'src/pages/users/utils/get-onboarding-status-badge-variant';

describe('getOnboardingStatusBadgeVariant', () => {
  it('returns correct variant', () => {
    expect(
      getOnboardingStatusBadgeVariant(OnboardingStatus.failed, false),
    ).toEqual('error');
    expect(
      getOnboardingStatusBadgeVariant(OnboardingStatus.verified, false),
    ).toEqual('success');
    expect(
      getOnboardingStatusBadgeVariant(OnboardingStatus.failed, true),
    ).toEqual('error');
    expect(
      getOnboardingStatusBadgeVariant(OnboardingStatus.verified, true),
    ).toEqual('warning');
  });
});
