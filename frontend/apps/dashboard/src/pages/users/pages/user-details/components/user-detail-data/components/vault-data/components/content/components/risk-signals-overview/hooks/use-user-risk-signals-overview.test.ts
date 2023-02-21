import {
  createUseRouterSpy,
  customRenderHook,
  waitFor,
} from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';

import useUserRiskSignalsOverview from './use-user-risk-signals-overview';
import {
  createRiskSignal,
  withRiskSignals,
} from './use-user-risk-signals-overview.test.config';

const useRouterSpy = createUseRouterSpy();

describe('useUserRiskSignalsOverview', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/users/detail', query: {} });
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
      const document = createRiskSignal({
        scopes: [SignalAttribute.document],
        severity: RiskSignalSeverity.High,
      });
      const riskSignalsResponse = [email, dob, ssn, document];
      withRiskSignals(riskSignalsResponse);

      const userId = 'fp_id_yCZehsWNeywHnk5JqL20u';
      const { result } = customRenderHook(() =>
        useUserRiskSignalsOverview(userId),
      );
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
        document: {
          low: [],
          medium: [],
          high: [document],
        },
      });
    });
  });
});
