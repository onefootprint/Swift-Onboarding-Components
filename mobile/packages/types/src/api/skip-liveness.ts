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
  unavailableOnDevice = 'unavailable_on_device',
  failed = 'failed',
  unknown = 'unknown',
}

export enum SkipLivenessClientType {
  web = 'web',
  mobile = 'mobile',
}

export type SkipLivenessResponse = {};
