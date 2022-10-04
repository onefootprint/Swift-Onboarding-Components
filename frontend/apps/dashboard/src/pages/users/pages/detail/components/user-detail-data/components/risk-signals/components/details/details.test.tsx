import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';

import Details from './details';
import {
  riskSignalDetailsFixture,
  withRiskSignalDetails,
  withRiskSignalDetailsError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<RiskSignalsDetails />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/users/detail',
      query: {
        risk_signal_id: riskSignalDetailsFixture.id,
        risk_signal_note: riskSignalDetailsFixture.note,
      },
    });
  });

  const renderRiskSignalDetails = () => {
    customRender(<Details />);
  };

  describe('when the request fails', () => {
    it('should show an error message within the drawer', async () => {
      withRiskSignalDetailsError();
      renderRiskSignalDetails();

      await waitFor(() => {
        const drawer = screen.getByTestId('risk-signal-details-loading');
        expect(drawer.getAttribute('aria-busy')).toBeTruthy();
      });

      await waitForElementToBeRemoved(() =>
        screen.queryByTestId('risk-signal-details-loading'),
      );

      const error = screen.getByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });

  describe('when the request succeeds', () => {
    it('should show a loading and then the data', async () => {
      withRiskSignalDetails();
      renderRiskSignalDetails();

      await waitFor(() => {
        const drawer = screen.getByTestId('risk-signal-details-loading');
        expect(drawer.getAttribute('aria-busy')).toBeTruthy();
      });

      await waitForElementToBeRemoved(() =>
        screen.queryByTestId('risk-signal-details-loading'),
      );

      const note = screen.getByText(riskSignalDetailsFixture.note);
      expect(note).toBeInTheDocument();

      const dataVendor = screen.getByText(riskSignalDetailsFixture.dataVendor);
      expect(dataVendor).toBeInTheDocument();

      const scope = screen.getByText(riskSignalDetailsFixture.scope);
      expect(scope).toBeInTheDocument();

      const noteDetails = screen.getByText(
        riskSignalDetailsFixture.noteDetails,
      );
      expect(noteDetails).toBeInTheDocument();

      riskSignalDetailsFixture.relatedSignals.forEach(relatedSignal => {
        expect(screen.getByText(relatedSignal.note)).toBeInTheDocument();
      });
    });

    describe('when the user clicks on the "Related Signal" row', () => {
      it('should append risk signal id and note to the url', async () => {
        const pushMockFn = jest.fn();
        useRouterSpy({
          pathname: '/users/detail',
          query: {
            risk_signal_id: riskSignalDetailsFixture.id,
            risk_signal_note: riskSignalDetailsFixture.note,
          },
          push: pushMockFn,
        });

        withRiskSignalDetails();
        renderRiskSignalDetails();

        const [firstRelatedSignal] = riskSignalDetailsFixture.relatedSignals;
        const firstRelatedSignalRow = screen.getByTestId(firstRelatedSignal.id);
        await userEvent.click(firstRelatedSignalRow);

        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              risk_signal_id: firstRelatedSignal.id,
              risk_signal_note: firstRelatedSignal.note,
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });

    describe('when the user clicks on the raw response "Hide" or "Show" button', () => {
      it('should toggle the code block', async () => {
        withRiskSignalDetails();
        renderRiskSignalDetails();

        await waitFor(() => {
          const rawResponse = screen.getByTestId('raw-response-json');
          expect(rawResponse).toBeInTheDocument();
        });

        const hideButton = screen.getByRole('button', { name: 'Hide' });
        await userEvent.click(hideButton);
        expect(
          screen.queryByTestId('raw-response-json'),
        ).not.toBeInTheDocument();

        const showButton = screen.getByRole('button', { name: 'Show' });
        await userEvent.click(showButton);
        expect(screen.getByTestId('raw-response-json')).toBeInTheDocument();
      });
    });
  });
});
