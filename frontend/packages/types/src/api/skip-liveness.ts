export type SkipLivenessRequest = {
  authToken: string;
  context: SkipLivenessContext;
};

export type SkipLivenessContext = {
  reason: SkipLivenessReason;
  clientType: SkipLivenessClientType;
  numAttempts: number;
  attempts: PasskeyAttemptContext[];
};

export type PasskeyAttemptContext = {
  errorMessage: string;
  elapsedTimeInOsPromptMs?: number;
};

export enum SkipLivenessReason {
  unavailable = 'unavailable',
  failed = 'failed',
}

export enum SkipLivenessClientType {
  web = 'web',
  mobile = 'mobile',
}

export type SkipLivenessResponse = {};
