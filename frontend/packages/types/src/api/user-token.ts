export enum UserTokenScope {
  signup = 'SignUp',
  sensitiveProfile = 'SensitiveProfile',
  orgOnboarding = 'OrgOnboarding',
}

export type UserTokenRequest = {
  authToken: string;
};

export type UserTokenResponse = {
  scopes: UserTokenScope[];
};
