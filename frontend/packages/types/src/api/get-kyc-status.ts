export enum KycStatus {
  waiting = 'waiting',
  inProgress = 'in_progress',
  canceled = 'canceled',
  failed = 'failed',
  completed = 'complete',
}

export type GetKycStatusRequest = {
  authToken: string;
};

export type GetKycStatusResponse = {
  status: KycStatus;
};
