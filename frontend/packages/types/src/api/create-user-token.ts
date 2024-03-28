export type CreateUserTokenRequest = {
  authToken: string;
  requestedScope: CreateUserTokenScope;
};

export enum CreateUserTokenScope {
  onboardingComponents = 'onboarding_components',
}

export type CreateUserTokenResponse = {
  token: string;
  expiresAt: string;
};
