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

        const tr = screen.getByTestId('sig_ryxauTlDX8hIm3wVRmm');
        expect(tr).toBeInTheDocument();

        const severity = within(tr).getByText('Low');
        expect(severity).toBeInTheDocument();

        const scopes = within(tr).getByText('Phone number');
        expect(scopes).toBeInTheDocument();

        const note = within(tr).getByText(
          "The consumer's phone number is possibly a wireless mobile number.",
        );
        expect(note).toBeInTheDocument();
      });

      describe('when clicking on the table row', () => {
        it('should append signal_id', async () => {
          const pushMockFn = jest.fn();
          useRouterSpy({
            pathname: '/users/detail',
            query: {
              footprint_user_id: footprintUserId,
            },
            push: pushMockFn,
          });
          await renderRiskSignalsAndWaitData();

          const tr = screen.getByTestId('sig_ryxauTlDX8hIm3wVRmm');
          await userEvent.click(tr);
          expect(pushMockFn).toHaveBeenCalledWith(
            {
              query: {
                signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
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
          it('should append signal_description', async () => {
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
                    signal_description: 'lorem',
                  },
                },
                undefined,
                { shallow: true },
              );
            });
          });
        });

        describe('when there is a signal_description', () => {
          it('should display the text on the table search', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                footprint_user_id: footprintUserId,
                signal_description: 'lorem',
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const search = screen.getByDisplayValue('lorem');
            expect(search).toBeInTheDocument();
          });
        });

        describe('when selecting a severity', () => {
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

            const filterButton = screen.getByRole('button', {
              name: 'Filters',
            });
            await userEvent.click(filterButton);

            const dialog = screen.getByRole('dialog', { name: 'Filters' });
            const mediumSeverityCheckbox =
              within(dialog).getByLabelText('Medium');
            await userEvent.click(mediumSeverityCheckbox);

            const submitButton = within(dialog).getByRole('button', {
              name: 'Apply',
            });
            await userEvent.click(submitButton);

            expect(pushMockFn).toHaveBeenCalledWith(
              {
                query: {
                  footprint_user_id: footprintUserId,
                  signal_severity: 'medium',
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

            const filterButton = screen.getByRole('button', {
              name: 'Filters',
            });
            await userEvent.click(filterButton);

            const dialog = screen.getByRole('dialog', { name: 'Filters' });
            const scope = within(dialog).getByLabelText('Email');
            await userEvent.click(scope);

            const submitButton = within(dialog).getByRole('button', {
              name: 'Apply',
            });
            await userEvent.click(submitButton);

            expect(pushMockFn).toHaveBeenCalledWith(
              {
                query: {
                  footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
                  signal_scope: 'email',
                },
              },
              undefined,
              { shallow: true },
            );
          });
        });

        describe('when there are risk signal filters in the URL', () => {
          it('should indicate the number of filters selected', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                signal_scope: 'email',
                signal_severity: 'high',
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const filterButton = screen.getByRole('button', {
              name: 'Filters · 2',
            });
            expect(filterButton).toBeInTheDocument();
          });
        });

        describe('when reseting the filters', () => {
          it('should remove all the signal filters from the URL', async () => {
            const pushMockFn = jest.fn();
            useRouterSpy({
              pathname: '/users/detail',
              query: {
                signal_scope: 'email',
                signal_severity: 'high',
                footprint_user_id: footprintUserId,
              },
              push: pushMockFn,
            });
            await renderRiskSignalsAndWaitData();

            const filterButton = screen.getByRole('button', {
              name: 'Filters · 2',
            });
            await userEvent.click(filterButton);

            const dialog = screen.getByRole('dialog', { name: 'Filters' });

            const resetButton = within(dialog).getByRole('button', {
              name: 'Clear',
            });
            await userEvent.click(resetButton);

            const submitButton = within(dialog).getByRole('button', {
              name: 'Apply',
            });
            await userEvent.click(submitButton);

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
