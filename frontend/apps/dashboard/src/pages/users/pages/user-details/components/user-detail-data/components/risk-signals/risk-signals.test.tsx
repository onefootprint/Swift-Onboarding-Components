import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import RiskSignals from './risk-signals';
import {
  withRiskSignals,
  withRiskSignalsError,
} from './risk-signals.test.config';

const useRouterSpy = createUseRouterSpy();
const footprintUserId = 'fp_id_yCZehsWNeywHnk5JqL20u';

describe('<RiskSignals />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        footprint_user_id: footprintUserId,
      },
    });
  });

  const renderRiskSignals = () => {
    customRender(<RiskSignals />);
  };

  const renderRiskSignalsAndWaitData = async () => {
    renderRiskSignals();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('listing the signals', () => {
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
        await renderRiskSignalsAndWaitData();

        const tr = screen.getByRole('row', { name: 'sig_ryxauTlDX8hIm3wVRmm' });
        expect(tr).toBeInTheDocument();

        const severity = within(tr).getByText('Low');
        expect(severity).toBeInTheDocument();

        const scopes = within(tr).getByText('Phone number');
        expect(scopes).toBeInTheDocument();

        const note = within(tr).getByText('VOIP phone number');
        expect(note).toBeInTheDocument();

        await userEvent.hover(note);
        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip', {
            name: "The consumer's phone number could be tied to an answering service, page, or VoIP.",
          });
          expect(tooltip).toBeInTheDocument();
        });
      });

      describe('when clicking on the table row', () => {
        it('should append risk_signal_id', async () => {
          const pushMockFn = jest.fn();
          useRouterSpy({
            pathname: '/users/detail',
            query: {
              footprint_user_id: footprintUserId,
            },
            push: pushMockFn,
          });
          await renderRiskSignalsAndWaitData();

          const tr = screen.getByRole('row', {
            name: 'sig_ryxauTlDX8hIm3wVRmm',
          });
          await userEvent.click(tr);
          expect(pushMockFn).toHaveBeenCalledWith(
            {
              query: {
                risk_signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
                footprint_user_id: footprintUserId,
              },
            },
            undefined,
            { shallow: true },
          );
        });
      });

      describe('when filtering', () => {
        describe('when typing on the table search', () => {
          it('should append risk_signal_description', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const search = screen.getByPlaceholderText('Search...');
            await userEvent.type(search, 'lorem');
            await waitFor(() => {
              expect(pushMockFn).toHaveBeenCalledWith(
                {
                  query: {
                    footprint_user_id: footprintUserId,
                    risk_signal_description: 'lorem',
                  },
                },
                undefined,
                { shallow: true },
              );
            });
          });
        });

        describe('when there is a risk_signal_description', () => {
          it('should display the text on the table search', async () => {
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                footprint_user_id: footprintUserId,
                risk_signal_description: 'lorem',
              },
            });
            await renderRiskSignalsAndWaitData();

            const search = screen.getByDisplayValue('lorem');
            expect(search).toBeInTheDocument();
          });
        });

        describe('when selecting a severity', () => {
          it('should append a risk_signal_severity', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const trigger = screen.getByRole('button', { name: 'Severity' });
            await userEvent.click(trigger);

            const highSeverity = screen.getByRole('checkbox', { name: 'High' });
            await userEvent.click(highSeverity);

            const applyButton = screen.getByRole('button', { name: 'Apply' });
            await userEvent.click(applyButton);

            expect(pushMockFn).toHaveBeenCalledWith(
              {
                query: {
                  footprint_user_id: footprintUserId,
                  risk_signal_severity: ['high'],
                },
              },
              undefined,
              { shallow: true },
            );
          });
        });

        describe('when selecting a scope', () => {
          it('should append a signal_severity', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const trigger = screen.getByRole('button', { name: 'Scope' });
            await userEvent.click(trigger);

            const email = screen.getByRole('checkbox', { name: 'Email' });
            await userEvent.click(email);

            const applyButton = screen.getByRole('button', { name: 'Apply' });
            await userEvent.click(applyButton);

            expect(pushMockFn).toHaveBeenCalledWith(
              {
                query: {
                  footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
                  risk_signal_scope: ['email'],
                },
              },
              undefined,
              { shallow: true },
            );
          });
        });

        describe('when there are risk signal filters in the URL', () => {
          it('should indicate the filters selected', async () => {
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                risk_signal_scope: 'email',
                risk_signal_severity: 'high',
                footprint_user_id: footprintUserId,
              },
            });
            await renderRiskSignalsAndWaitData();

            const high = screen.getByRole('button', { name: 'High' });
            expect(high).toBeInTheDocument();

            const email = screen.getByRole('button', { name: 'Email' });
            expect(email).toBeInTheDocument();
          });
        });

        describe('when reseting the filters', () => {
          it('should remove all the signal filters from the URL', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                risk_signal_scope: 'email',
                risk_signal_severity: 'high',
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const clear = screen.getByRole('button', { name: 'Clear filters' });
            await userEvent.click(clear);

            expect(pushMockFn).toHaveBeenCalledWith(
              {
                query: {
                  footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
                },
              },
              undefined,
              { shallow: true },
            );
          });
        });
      });
    });
  });
});
