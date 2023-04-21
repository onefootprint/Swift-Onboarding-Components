export type SocureContext =
  | 'homepage'
  | 'profile'
  | 'transaction'
  | 'signup'
  | 'login'
  | 'password'
  | 'checkout';

export type SocureRequest = {
  publicKey: string;
  endpoint: string;
  userConsent: boolean;
  context: SocureContext;
};

export type SocureResponse = {
  result: 'Captured' | 'Ignored';
  sessionId?: string;
};
