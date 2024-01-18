export type CreateTokenRequest = {
  entityId: string;
  kind: TokenKind;
  key?: string;
};

export enum TokenKind {
  onboard = 'onboard',
  reonboard = 'reonboard',
  inherit = 'inherit',
  user = 'user',
  updateAuthMethods = 'update_auth_methods',
}

export type CreateTokenResponse = {
  token: string;
  link: string;
  expiresAt: string;
};
