import {
  createUseRouterSpy,
  renderHook,
  waitFor,
  Wrapper,
} from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';

import useRiskSignalsOverview from './use-risk-signals-overview';
import {
  createRiskSignal,
  withRiskSignals,
} from './use-risk-signals-overview.test.config';

const routerSpy = createUseRouterSpy();

describe('useRiskSignalsOverview', () => {
  beforeEach(() => {
    routerSpy({
      pathname: '/detail?footprint_user_id=fp_id_yCZehsWNeywHnk5JqL20u',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
  });

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

      const { result } = renderHook(() => useRiskSignalsOverview(), {
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
