export type OnboardingAuthorizeRequest = {
  authToken: string;
};

export type OnboardingAuthorizeResponse = {
  validationToken: string; // A cryptographically generated auth token to authenticate a session
};
