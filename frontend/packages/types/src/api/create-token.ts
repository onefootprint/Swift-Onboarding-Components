export type CreateTokenRequest = {
  entityId: string;
  kind: TokenKind;
  key?: string;
  sendLink: boolean;
};

export enum TokenKind {
  onboard = 'onboard',
  reonboard = 'reonboard',
  inherit = 'inherit',
  user = 'user',
  updateAuthMethods = 'update_auth_methods',
}

export enum ContactInfoKind {
  phone = 'phone',
  email = 'email',
}

export type CreateTokenResponse = {
  token: string;
  link: string;
  expiresAt: string;
  deliveryMethod: ContactInfoKind;
};
