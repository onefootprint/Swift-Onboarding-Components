import { customRender, mockRouter, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';

import RiskSignalsList from '.';
import { withRiskSignals, withRiskSignalsError } from './risk-signals.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const id = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe.skip('<RiskSignals />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/entities');
    mockRouter.query = {
      id,
    };
  });

  const renderRiskSignals = () => {
    customRender(<RiskSignalsList />);
  };

  const renderRiskSignalsAndWaitData = async () => {
    renderRiskSignals();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the risk signal fails', () => {
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
        expect(within(table).getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the risk signals succeeds', () => {
    beforeAll(() => {
      withRiskSignals();
    });

    it('should show a spinner and the data within the table', async () => {
      await renderRiskSignalsAndWaitData();

      const tr = screen.getByRole('row', { name: 'sig_ryxauTlDX8hIm3wVRmm' });
      expect(tr).toBeInTheDocument();

      const severity = within(tr).getByText('Low');
      expect(severity).toBeInTheDocument();

      const scopes = within(tr).getByText('Phone number');
      expect(scopes).toBeInTheDocument();

      const reasonCode = within(tr).getByText('phone_number_located_is_voip');
      expect(reasonCode).toBeInTheDocument();

      await userEvent.hover(reasonCode);
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', {
          name: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
        });
        expect(tooltip).toBeInTheDocument();
      });
    });

    describe('when clicking on the table row', () => {
      it('should append risk_signal_id', async () => {
        await renderRiskSignalsAndWaitData();
        const tr = screen.getByRole('row', {
          name: 'sig_ryxauTlDX8hIm3wVRmm',
        });
        await userEvent.click(tr);
        expect(mockRouter).toMatchObject({
          query: {
            risk_signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
            id,
          },
        });
      });
    });

    describe('when filtering', () => {
      describe('when typing on the table search', () => {
        it('should append risk_signal_description', async () => {
          await renderRiskSignalsAndWaitData();

          const search = screen.getByPlaceholderText('Search...');
          await userEvent.type(search, 'lorem');
          await waitFor(() => {
            expect(mockRouter).toMatchObject({
              query: {
                id,
                risk_signal_description: 'lorem',
              },
            });
          });
        });
      });

      describe('when there is a risk_signal_description', () => {
        it('should display the text on the table search', async () => {
          await renderRiskSignalsAndWaitData();

          const search = screen.getByDisplayValue('lorem');
          expect(search).toBeInTheDocument();
        });
      });

      describe('when selecting a severity', () => {
        it('should append a risk_signal_severity', async () => {
          await renderRiskSignalsAndWaitData();

          const trigger = screen.getByRole('button', { name: 'Severity' });
          await userEvent.click(trigger);

          const highSeverity = screen.getByRole('checkbox', { name: 'High' });
          await userEvent.click(highSeverity);

          const applyButton = screen.getByRole('button', { name: 'Apply' });
          await userEvent.click(applyButton);

          expect(mockRouter).toMatchObject({
            query: {
              id,
              risk_signal_severity: ['high'],
            },
          });
        });
      });

      describe('when selecting a scope', () => {
        it('should append a signal_severity', async () => {
          await renderRiskSignalsAndWaitData();

          const trigger = screen.getByRole('button', { name: 'Scope' });
          await userEvent.click(trigger);

          const email = screen.getByRole('checkbox', { name: 'Email' });
          await userEvent.click(email);

          const applyButton = screen.getByRole('button', { name: 'Apply' });
          await userEvent.click(applyButton);

          expect(mockRouter).toMatchObject({
            query: {
              id,
              risk_signal_scope: ['email'],
            },
          });
        });
      });

      describe('when there are risk signal filters in the URL', () => {
        it('should indicate the filters selected', async () => {
          await renderRiskSignalsAndWaitData();

          const high = screen.getByRole('button', { name: 'High' });
          expect(high).toBeInTheDocument();

          const email = screen.getByRole('button', { name: 'Email' });
          expect(email).toBeInTheDocument();
        });
      });

      describe('when reseting the filters', () => {
        it('should remove all the signal filters from the URL', async () => {
          mockRouter.setCurrentUrl('/entities');
          mockRouter.query = {
            id,
            risk_signal_scope: 'email',
            risk_signal_severity: 'high',
          };
          await renderRiskSignalsAndWaitData();

          const clear = screen.getByRole('button', { name: 'Clear filters' });
          await userEvent.click(clear);

          expect(mockRouter).toMatchObject({
            query: {
              id: 'fp_id_yCZehsWNeywHnk5JqL20u',
            },
          });
        });
      });
    });
  });
});
