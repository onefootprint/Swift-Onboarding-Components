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
  | SessionCompleteResult
  | SessionCanceledResult
  | SessionErroredResult;
