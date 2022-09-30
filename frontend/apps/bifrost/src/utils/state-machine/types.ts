import { CollectedDataOption, UserData } from '@onefootprint/types';

// TODO: update this based on the requirements from the API
export type OnboardingData = {
  missingWebauthnCredentials: boolean;
  missingAttributes: readonly CollectedDataOption[]; // Initial set of attributes received from /onboarding
  data: UserData; // Filled user data
  validationToken?: string;
};
