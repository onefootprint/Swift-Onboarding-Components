export type OnboardingRequest = {
  authToken: string;
};

export type OnboardingResponse = {
  // A cryptographically generated auth token to authenticate a session
  // Returned only if the user has already authorized the configuration for tenant
  validationToken?: string;
};
