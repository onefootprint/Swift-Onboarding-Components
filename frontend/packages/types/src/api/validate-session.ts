import type { SessionStatus } from '../data';

export type ValidateSessionRequest = {
  authToken?: string;
};

export type ValidateSessionResponse = {
  sessionStatus: SessionStatus;
};
