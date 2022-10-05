import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Signals from './signals';
import {
  signalsFixture,
  withSignals,
  withSignalsError,
} from './signals.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Signals />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/users/detail', query: {} });
  });

  const renderSignals = () => {
    customRender(<Signals />);
  };

  describe('listing the signals', () => {
    describe('when the request fails', () => {
      beforeAll(() => {
        withSignalsError();
      });

      it('should show a spinner and then an error message', async () => {
        renderSignals();

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
        withSignals();
      });

      it('should show a spinner and the data within the table', async () => {
        renderSignals();

        await waitFor(() => {
          const table = screen.getByRole('table');
          const isLoading = table.getAttribute('aria-busy');
          expect(isLoading).toBe('false');
        });

        const { data } = signalsFixture;
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

      describe('when clicking on the table row', () => {
        it('should append risk signal id and note to the url', async () => {
          const pushMockFn = jest.fn();
          useRouterSpy({
            pathname: '/users/detail',
            query: {},
            push: pushMockFn,
          });
          renderSignals();

          const [firstRiskSignal] = signalsFixture.data;
          const table = screen.getByRole('table');
          await waitFor(() => {
            const note = within(table).getByText(firstRiskSignal.note);
            expect(note).toBeInTheDocument();
          });
          await userEvent.click(within(table).getByText(firstRiskSignal.note));

          expect(pushMockFn).toHaveBeenCalledWith(
            {
              query: {
                signal_id: firstRiskSignal.id,
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
