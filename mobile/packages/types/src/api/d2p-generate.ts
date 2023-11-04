import type { D2PMeta } from '../data';

export type D2PGenerateRequest = {
  authToken: string;
  meta?: D2PMeta;
};

export type D2PGenerateResponse = {
  // Scoped auth token that will be:
  // 1) used to pass state between the desktop and phone AND
  // 2) used on the phone as the authentication that allows the phone to register a new webauthn credential
  authToken: string;
};
