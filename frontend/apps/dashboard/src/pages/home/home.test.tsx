import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import Home from './home';
import { emptyOrgMetricsFixture, withOrgMetrics, withOrgMetricsError, withPlaybooks } from './home.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Home />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: '/org/metrics',
      query: {},
    });
    withPlaybooks();
  });

  const renderHome = () => customRender(<Home />);

  const renderHomeAndWaitData = async () => {
    renderHome();
    await waitFor(() => {
      const content = screen.getByTestId('onboarding-metrics-content');
      expect(content).toBeInTheDocument();
    });
  };

  const renderHomeAndWaitNotLoading = async () => {
    renderHome();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('progressbar', {
        name: 'Loading home...',
      }),
    );
  };

  describe('when the request to fetch the org metrics succeeds', () => {
    it('should show a loading screen while the data is being fetched', async () => {
      withOrgMetrics();
      renderHome();
      await waitFor(() => {
        const loader = screen.getByRole('progressbar', {
          name: 'Loading home...',
        });
        expect(loader).toBeInTheDocument();
      });
    });

    describe('when all metric values are 0', () => {
      beforeEach(() => {
        withOrgMetrics(emptyOrgMetricsFixture);
      });

      it('should show all 6 metrics', async () => {
        await renderHomeAndWaitData();
        const metricBoxes = screen.getAllByRole('group');
        expect(metricBoxes).toHaveLength(6);
      });

      it('should show the first row of metrics with values of 0', async () => {
        await renderHomeAndWaitData();

        const successfulOnboardings = screen.getByRole('group', {
          name: 'Successful onboardings',
        });
        expect(within(successfulOnboardings).getByText('0')).toBeInTheDocument();

        const failedOnboardings = screen.getByRole('group', {
          name: 'Failed onboardings',
        });
        expect(within(failedOnboardings).getByText('0')).toBeInTheDocument();

        const incompleteOnboardings = screen.getByRole('group', {
          name: 'Incomplete onboardings',
        });
        expect(within(incompleteOnboardings).getByText('0')).toBeInTheDocument();
      });

      it('should show the second row of metrics with values of 0', async () => {
        await renderHomeAndWaitData();

        const totalOnboardings = screen.getByRole('group', {
          name: 'Total onboardings',
        });
        expect(within(totalOnboardings).getByText('0')).toBeInTheDocument();

        const passRate = screen.getByRole('group', {
          name: 'Pass rate',
        });
        expect(within(passRate).getByText('0%')).toBeInTheDocument();

        const newUserVaults = screen.getByRole('group', {
          name: 'New user vaults',
        });
        expect(within(newUserVaults).getByText('0')).toBeInTheDocument();
      });
    });

    describe('when metric values are non-zero', () => {
      beforeEach(() => {
        withOrgMetrics();
      });

      it('should show all 6 metrics', async () => {
        await renderHomeAndWaitData();
        const metricBoxes = screen.getAllByRole('group');
        expect(metricBoxes).toHaveLength(6);
      });

      it('should show the first row of metrics with correct values', async () => {
        await renderHomeAndWaitData();

        const successfulOnboardings = screen.getByRole('group', {
          name: 'Successful onboardings',
        });
        expect(within(successfulOnboardings).getByText('1,036,817')).toBeInTheDocument();

        const failedOnboardings = screen.getByRole('group', {
          name: 'Failed onboardings',
        });
        expect(within(failedOnboardings).getByText('17,187')).toBeInTheDocument();

        const incompleteOnboardings = screen.getByRole('group', {
          name: 'Incomplete onboardings',
        });
        expect(within(incompleteOnboardings).getByText('4,810')).toBeInTheDocument();
      });

      it('should show the second row of metrics with correct values', async () => {
        await renderHomeAndWaitData();

        const totalOnboardings = screen.getByRole('group', {
          name: 'Total onboardings',
        });
        expect(within(totalOnboardings).getByText('1,058,814')).toBeInTheDocument();

        const passRate = screen.getByRole('group', {
          name: 'Pass rate',
        });
        expect(within(passRate).getByText('98.4%')).toBeInTheDocument();

        const newUserVaults = screen.getByRole('group', {
          name: 'New user vaults',
        });
        expect(within(newUserVaults).getByText('8,910')).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the org metrics fails', () => {
    it('should show an error message', async () => {
      withOrgMetricsError();
      await renderHomeAndWaitNotLoading();

      await waitFor(() => {
        const error = screen.getByText('Something went wrong.', {
          exact: false,
        });
        expect(error).toBeInTheDocument();
      });
    });
  });
});
