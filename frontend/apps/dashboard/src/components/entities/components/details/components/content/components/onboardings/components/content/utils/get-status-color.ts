import type { Color } from '@onefootprint/design-tokens';
import type { OnboardingStatus } from '@onefootprint/request-types/dashboard';

const getStatusColor = (status: OnboardingStatus): Color => {
  if (status === 'pass') return 'success';
  if (status === 'fail') return 'error';
  return 'neutral';
};

export default getStatusColor;
