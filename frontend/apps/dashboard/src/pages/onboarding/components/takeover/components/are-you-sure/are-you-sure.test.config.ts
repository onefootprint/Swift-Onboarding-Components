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

export const twoInProgressOnboardingsFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: 'https://flexcar.com',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
  {
    fpId: '2',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Composer',
      websiteUrl: 'https://composer.com',
    },
    timestamp: '2023-05-02T12:00:00Z',
  },
];

export const threeInProgressOnboardingsFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: 'https://flexcar.com',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
  {
    fpId: '2',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Composer',
      websiteUrl: 'https://composer.com',
    },
    timestamp: '2023-05-02T12:00:00Z',
  },
  {
    fpId: '3',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Bloom',
      websiteUrl: 'https://bloom.com',
    },
    timestamp: '2023-05-03T12:00:00Z',
  },
];

export const fourInProgressOnboardingsFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: 'https://flexcar.com',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
  {
    fpId: '2',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Composer',
      websiteUrl: 'https://composer.com',
    },
    timestamp: '2023-05-02T12:00:00Z',
  },
  {
    fpId: '3',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Bloom',
      websiteUrl: 'https://bloom.com',
    },
    timestamp: '2023-05-03T12:00:00Z',
  },
  {
    fpId: '4',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Findigs',
      websiteUrl: 'https://findigs.com',
    },
    timestamp: '2023-05-04T12:00:00Z',
  },
];

export const oneInProgressOnboardingNoLinkFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: '',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
];

export const twoInProgressOnboardingsNoLinksFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: '',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
  {
    fpId: '2',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Composer',
      websiteUrl: '',
    },
    timestamp: '2023-05-02T12:00:00Z',
  },
];

export const twoInProgressOnboardingsOneLinkFixture: InProgressOnboarding[] = [
  {
    fpId: '1',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Flexcar',
      websiteUrl: 'http://flexcar.com',
    },
    timestamp: '2023-05-01T12:00:00Z',
  },
  {
    fpId: '2',
    status: OnboardingStatus.incomplete,
    tenant: {
      name: 'Composer',
      websiteUrl: '',
    },
    timestamp: '2023-05-02T12:00:00Z',
  },
];
