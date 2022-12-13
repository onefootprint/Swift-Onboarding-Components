import { renderHook, waitFor, Wrapper } from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';

import useGetRiskSignals from './use-get-risk-signals';
import {
  createRiskSignal,
  withRiskSignals,
} from './use-get-risk-signals.test.config';

describe('useGetRiskSignals', () => {
  describe('when the request succeeds', () => {
    it('should return the correct user id', async () => {
      const email = createRiskSignal({
        scopes: [SignalAttribute.email],
        severity: RiskSignalSeverity.Low,
      });
      const dob = createRiskSignal({
        scopes: [SignalAttribute.dob],
        severity: RiskSignalSeverity.Medium,
      });
      const ssn = createRiskSignal({
        scopes: [SignalAttribute.ssn],
        severity: RiskSignalSeverity.High,
      });
      const riskSignalsResponse = [email, dob, ssn];
      withRiskSignals(riskSignalsResponse);

      const userId = 'fp_id_yCZehsWNeywHnk5JqL20u';
      const { result } = renderHook(() => useGetRiskSignals(userId), {
        wrapper: Wrapper,
      });
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      expect(result.current.data).toEqual({
        basic: {
          low: [email],
          medium: [],
          high: [],
        },
        identity: {
          low: [],
          medium: [dob],
          high: [ssn],
        },
        address: {
          low: [],
          medium: [],
          high: [],
        },
      });
    });
  });
});
