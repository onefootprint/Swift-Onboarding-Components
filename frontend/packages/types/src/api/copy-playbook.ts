import type { OnboardingConfig } from '../data';

export type CopyPlaybookRequest = {
  name: string;
  isLive: boolean;
  playbookId: string;
};

export type CopyPlaybookResponse = OnboardingConfig;
