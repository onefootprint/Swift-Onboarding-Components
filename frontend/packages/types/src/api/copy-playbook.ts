import type { OnboardingConfig } from '../data';

export type CopyPlaybookRequest = {
  isLive: boolean;
  name: string;
  playbookId: string;
  tenantId: string;
  tenantName: string;
};

export type CopyPlaybookResponse = OnboardingConfig;
