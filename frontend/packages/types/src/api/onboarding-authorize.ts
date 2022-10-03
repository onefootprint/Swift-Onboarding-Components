export type OnboardingAuthorizeRequest = {
  authToken: string;
  tenantPk: string;
};

export type OnboardingAuthorizeResponse = {
  validationToken: string; // A cryptographically generated auth token to authenticate a session
};
