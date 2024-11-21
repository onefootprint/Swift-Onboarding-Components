import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';

const getCreatedTime = (playbook: OnboardingConfiguration) => {
  return new Date(playbook.createdAt).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export default getCreatedTime;
