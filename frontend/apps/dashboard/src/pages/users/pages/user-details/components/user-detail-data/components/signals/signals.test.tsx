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
import { withSignals, withSignalsError } from './signals.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Signals />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname:
        '/users/detailusers/detail?footprint_user_id=fp_id_yCZehsWNeywHnk5JqL20u',
      query: {
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
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

        const tr = screen.getByTestId('sig_ryxauTlDX8hIm3wVRmm');
        expect(tr).toBeInTheDocument();

        const severity = within(tr).getByText('Info');
        expect(severity).toBeInTheDocument();

        const scopes = within(tr).getByText('Phone number');
        expect(scopes).toBeInTheDocument();

        const note = within(tr).getByText(
          "The consumer's phone number is possibly a wireless mobile number.",
        );
        expect(note).toBeInTheDocument();
      });

      describe('when clicking on the table row', () => {
        it('should append risk signal id and note to the url', async () => {
          const pushMockFn = jest.fn();
          useRouterSpy({
            pathname:
              '/users/detailusers/detail?footprint_user_id=fp_id_yCZehsWNeywHnk5JqL20u',
            query: {
              footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
            },
            push: pushMockFn,
          });
          renderSignals();

          await waitFor(() => {
            const table = screen.getByRole('table');
            const isLoading = table.getAttribute('aria-busy');
            expect(isLoading).toBe('false');
          });

          const tr = screen.getByTestId('sig_ryxauTlDX8hIm3wVRmm');
          await userEvent.click(tr);
          expect(pushMockFn).toHaveBeenCalledWith(
            {
              query: {
                signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
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
