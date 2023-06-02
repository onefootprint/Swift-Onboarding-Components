export enum UserTokenScope {
  signup = 'sign_up',
  basicProfile = 'basic_profile',
  sensitiveProfile = 'sensitive_profile',
  orgOnboarding = 'org_onboarding',
}

export type UserTokenRequest = {
  authToken: string;
};

export type UserTokenResponse = {
  scopes: UserTokenScope[];
};
