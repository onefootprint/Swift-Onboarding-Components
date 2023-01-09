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
        signal_id: 'sig_ryxauTlDX8hIm3wVRmm',
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

      const titleAndDescription = screen.queryAllByText(
        "The consumer's phone number is possibly a wireless mobile number.",
      );
      expect(titleAndDescription).toHaveLength(2);

      const vendors = screen.getByText('idology');
      expect(vendors).toBeInTheDocument();

      const scope = screen.getByText('Phone number');
      expect(scope).toBeInTheDocument();
    });
  });
});
