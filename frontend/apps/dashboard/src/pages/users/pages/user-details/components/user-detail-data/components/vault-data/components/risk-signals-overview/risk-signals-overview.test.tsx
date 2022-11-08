import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import { RiskSignalSeverity, SignalAttribute } from '@onefootprint/types';
import React from 'react';

import createRiskSignal from './risk-signal-overview.test.config';
import RiskSignalsOverview, {
  RiskSignalsOverviewProps,
} from './risk-signals-overview';

const useRouterSpy = createUseRouterSpy();

describe('<RiskSignalsOverview />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/users/detail', query: {} });
  });

  const renderRiskSignalsOverview = ({
    data,
    error,
    isLoading,
  }: RiskSignalsOverviewProps) =>
    customRender(
      <RiskSignalsOverview data={data} error={error} isLoading={isLoading} />,
    );

  describe('when it is loading', () => {
    it('should show the loading spinners', () => {
      renderRiskSignalsOverview({ isLoading: true });
      const loading = screen.getAllByRole('progressbar');
      expect(loading.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('when it has failed', () => {
    it('should show the error message', () => {
      renderRiskSignalsOverview({
        error: {
          message: 'Something went wrong',
        },
      });
      const error = screen.getByText('Something went wrong');

      expect(error).toBeInTheDocument();
    });
  });

  describe('when it has succeded', () => {
    it('should display the data', () => {
      renderRiskSignalsOverview({
        data: {
          high: [],
          medium: [
            createRiskSignal({
              scopes: [SignalAttribute.name],
              severity: RiskSignalSeverity.Medium,
            }),
            createRiskSignal({
              scopes: [SignalAttribute.email],
              severity: RiskSignalSeverity.Medium,
            }),
          ],
          low: [],
        },
      });

      const text = screen.getByText('risk signal', { exact: false });
      expect(text.textContent).toEqual('2 Medium risk signals');
    });
  });
});
