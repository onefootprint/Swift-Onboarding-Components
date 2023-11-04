import type { RiskSignalSeverity } from './risk-signal';

export enum MatchLevel {
  NoMatch = 'no_match',
  NotVerified = 'not_verified',
  CouldNotMatch = 'could_not_match',
  Partial = 'partial',
  Verified = 'verified',
  Exact = 'exact',
}

export type MatchSignal = {
  description: string;
  matchLevel: MatchLevel;
  note: string;
  reasonCode: string;
  severity: RiskSignalSeverity;
};
