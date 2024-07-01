type SessionAuthCompleteResult = {
  kind: 'auth_complete';
  authToken: string;
  vaultingToken: string;
};

type SessionCompleteResult = {
  kind: 'complete';
  validationToken: string;
};

type SessionCanceledResult = {
  kind: 'cancel';
};

type SessionErroredResult = {
  kind: 'error';
  error: string;
};

export type SessionResult =
  | SessionAuthCompleteResult // <-- This type is only used in the onboarding components
  | SessionCompleteResult
  | SessionCanceledResult
  | SessionErroredResult;
