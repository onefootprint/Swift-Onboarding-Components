import isSentilinkSignal from './is-sentilink-signal';
import { nonSentilinkRiskSignal, sentilinkRiskSignal } from './is-sentilink-signal.test.config';

describe('isSentilinkSignal', () => {
  it('should return true for a Sentilink risk signal', () => {
    const result = isSentilinkSignal(sentilinkRiskSignal);
    expect(result).toBe(true);
  });

  it('should return false for a non-Sentilink risk signal', () => {
    const result = isSentilinkSignal(nonSentilinkRiskSignal);
    expect(result).toBe(false);
  });

  it('should return true for all Sentilink reason codes', () => {
    const sentilinkReasonCodes = [
      'sentilink_synthetic_identity_high_risk',
      'sentilink_synthetic_identity_medium_risk',
      'sentilink_synthetic_identity_low_risk',
      'sentilink_identity_theft_high_risk',
      'sentilink_identity_theft_medium_risk',
      'sentilink_identity_theft_low_risk',
    ];

    sentilinkReasonCodes.forEach(reasonCode => {
      const testSignal = { ...sentilinkRiskSignal, reasonCode };
      const result = isSentilinkSignal(testSignal);
      expect(result).toBe(true);
    });
  });

  it('should return false for a risk signal with an unknown reason code', () => {
    const unknownReasonCodeSignal = { ...sentilinkRiskSignal, reasonCode: 'unknown_reason_code' };
    const result = isSentilinkSignal(unknownReasonCodeSignal);
    expect(result).toBe(false);
  });
});
