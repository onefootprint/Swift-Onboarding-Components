export enum UserTokenScope {
  signup = 'sign_up',
  basicProfile = 'basic_profile',
  sensitiveProfile = 'sensitive_profile',
  explicitAuth = 'explicit_auth',
}

export type UserTokenRequest = {
  authToken: string;
};

export type UserTokenResponse = {
  scopes: UserTokenScope[];
};
