export type D2PGenerateRequest = {
  authToken: string;
  meta?: {
    sessionId?: string; // bifrost session id
    opener?: string; // the device type that opened/generated the d2p session
  };
};

export type D2PGenerateResponse = {
  // Scoped auth token that will be:
  // 1) used to pass state between the desktop and phone AND
  // 2) used on the phone as the authentication that allows the phone to register a new webauthn credential
  authToken: string;
};
