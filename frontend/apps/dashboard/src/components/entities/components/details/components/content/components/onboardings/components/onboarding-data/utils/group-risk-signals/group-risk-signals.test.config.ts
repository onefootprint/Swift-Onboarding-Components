import { getRiskSignal } from '@onefootprint/fixtures/dashboard';
import type { RiskSignal } from '@onefootprint/request-types/dashboard';

export const riskSignalsFixture: RiskSignal[] = [
  getRiskSignal({
    group: 'aml',
    severity: 'low',
  }),
  getRiskSignal({
    group: 'web_device',
    severity: 'high',
  }),
  getRiskSignal({
    group: 'kyc',
    severity: 'info',
  }),
  getRiskSignal({
    group: 'aml',
    severity: 'medium',
  }),
  getRiskSignal({
    group: 'kyc',
    severity: 'high',
  }),
];

export const sameSeverityRiskSignalsFixture: RiskSignal[] = [
  getRiskSignal({
    group: 'behavior',
    severity: 'low',
  }),
  getRiskSignal({
    group: 'behavior',
    severity: 'low',
  }),
  getRiskSignal({
    group: 'behavior',
    severity: 'low',
  }),
];
