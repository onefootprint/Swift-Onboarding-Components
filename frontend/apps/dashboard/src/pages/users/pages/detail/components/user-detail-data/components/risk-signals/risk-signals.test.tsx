import {
  customRender,
  screen,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import RiskSignals from './risk-signals';
import {
  riskSignalsResponse,
  withRiskSignals,
  withRiskSignalsError,
} from './risk-signals.test.config';

describe('<RiskSignals />', () => {
  const renderRiskSignals = () => {
    customRender(<RiskSignals />);
  };

  describe('listing the risk signals', () => {
    describe('when the request fails', () => {
      beforeAll(() => {
        withRiskSignalsError();
      });

      it('should show a spinner and then an error message', async () => {
        renderRiskSignals();

        await waitFor(() => {
          const table = screen.getByRole('table');
          expect(table.getAttribute('aria-busy')).toBeTruthy();
        });

        await waitFor(() => {
          const table = screen.getByRole('table');
          expect(
            within(table).getByText('Something went wrong'),
          ).toBeInTheDocument();
        });
      });
    });

    describe('when the request succeeds', () => {
      beforeAll(() => {
        withRiskSignals();
      });

      it('should show a spinner and the data within the table', async () => {
        renderRiskSignals();

        await waitFor(() => {
          const table = screen.getByRole('table');
          const isLoading = table.getAttribute('aria-busy');
          expect(isLoading).toBe('false');
        });

        const { data } = riskSignalsResponse;
        const [firstRiskSignal] = data;
        const tr = screen.getByTestId(firstRiskSignal.id);
        expect(tr).toBeInTheDocument();

        const severity = within(tr).getByText(firstRiskSignal.severity, {
          exact: false,
        });
        expect(severity).toBeInTheDocument();

        const scope = within(tr).getByText(firstRiskSignal.scope);
        expect(scope).toBeInTheDocument();

        const note = within(tr).getByText(firstRiskSignal.note);
        expect(note).toBeInTheDocument();
      });
    });
  });
});
