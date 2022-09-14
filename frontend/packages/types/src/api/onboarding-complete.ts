export type OnboardingCompleteRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingCompleteResponse = {
  validationToken: string; // A cryptographically generated auth token to authenticate a session
  missingWebauthnCredentials: boolean;
};
