import { type InProgressOnboarding, OnboardingStatus } from '@onefootprint/types';

export const oneInProgressOnboardingFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: 'https://flexcar.com',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
];
