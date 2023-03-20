import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@onefootprint/test-utils';
import React from 'react';

import RiskSignalDetails from './details';
import {
  withRiskSignalDetails,
  withRiskSignalDetailsError,
} from './details.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: `/users/detail`,
      query: {
        risk_signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
        footprint_user_id: 'fp_id_yCZehsWNeywHnk5JqL20u',
      },
    });
  });

  const renderRiskSignalDetails = () => {
    customRender(<RiskSignalDetails />);
  };

  describe('when the request fails', () => {
    it('should show an error message within the drawer', async () => {
      withRiskSignalDetailsError();
      renderRiskSignalDetails();

      await waitFor(() => {
        const loadingTitle = screen.getByText('Loading...');
        expect(loadingTitle).toBeInTheDocument();
      });

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

      const title = screen.getByText('VOIP phone number');
      expect(title).toBeInTheDocument();

      const description = screen.getByText(
        "The consumer's phone number could be tied to an answering service, page, or VoIP.",
      );
      expect(description).toBeInTheDocument();

      const scopes = screen.getByText('Phone number and Date of Birth');
      expect(scopes).toBeInTheDocument();
    });
  });
});
