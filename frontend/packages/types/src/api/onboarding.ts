import { CollectedDataOption } from '../data';

export type OnboardingRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingResponse = {
  missingAttributes: CollectedDataOption[];
  missingWebauthnCredentials: boolean;
  // A cryptographically generated auth token to authenticate a session
  // Returned only if the user has already authorized the configuration for tenant
  validationToken?: string;
};
