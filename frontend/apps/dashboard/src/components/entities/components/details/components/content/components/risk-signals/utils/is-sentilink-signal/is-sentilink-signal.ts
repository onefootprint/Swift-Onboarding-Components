import type { RiskSignal as NewRiskSignal } from '@onefootprint/request-types/dashboard';
import type { RiskSignal } from '@onefootprint/types';

const isSentilinkSignal = (riskSignal: RiskSignal | NewRiskSignal) => {
  const sentilinkReasonCodes = [
    'sentilink_synthetic_identity_high_risk',
    'sentilink_synthetic_identity_medium_risk',
    'sentilink_synthetic_identity_low_risk',
    'sentilink_identity_theft_high_risk',
    'sentilink_identity_theft_medium_risk',
    'sentilink_identity_theft_low_risk',
  ];
  return sentilinkReasonCodes.includes(riskSignal.reasonCode);
};

export default isSentilinkSignal;
