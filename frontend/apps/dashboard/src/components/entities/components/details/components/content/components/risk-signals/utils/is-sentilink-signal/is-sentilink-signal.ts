import type { RiskSignal } from '@onefootprint/types';

const sentilinkReasonCodes = [
  'sentilink_synthetic_identity_high_risk',
  'sentilink_synthetic_identity_medium_risk',
  'sentilink_synthetic_identity_low_risk',
  'sentilink_identity_theft_high_risk',
  'sentilink_identity_theft_medium_risk',
  'sentilink_identity_theft_low_risk',
];

export default function isSentilinkSignal(riskSignal: RiskSignal) {
  return sentilinkReasonCodes.includes(riskSignal.reasonCode);
}
