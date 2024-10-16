import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';

export const sentilinkRiskSignal: RiskSignal = {
  description: 'High risk of synthetic identity',
  id: 'sentilink-001',
  note: 'Sentilink detected a high risk of synthetic identity',
  onboardingDecisionId: 'decision-001',
  reasonCode: 'sentilink_synthetic_identity_high_risk',
  scopes: [],
  severity: RiskSignalSeverity.High,
  timestamp: '2023-06-01T12:00:00Z',
  hasAmlHits: false,
};

export const nonSentilinkRiskSignal: RiskSignal = {
  description: 'Suspicious activity detected',
  id: 'general-001',
  note: 'Unusual transaction pattern observed',
  onboardingDecisionId: 'decision-002',
  reasonCode: 'email_not_found_on_file',
  scopes: [],
  severity: RiskSignalSeverity.Medium,
  timestamp: '2023-06-02T14:30:00Z',
  hasAmlHits: false,
};
