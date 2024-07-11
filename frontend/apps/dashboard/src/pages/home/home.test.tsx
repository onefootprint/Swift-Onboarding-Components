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
      const content = screen.getByRole('group', { name: 'Users' });
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

      it('should show all user metrics, hide business metrics', async () => {
        await renderHomeAndWaitData();
        const metricBoxes = screen.getAllByRole('region');
        expect(metricBoxes).toHaveLength(6);

        const content = screen.queryByRole('group', { name: 'Business' });
        expect(content).not.toBeInTheDocument();
      });

      it('should show the metrics with values of 0', async () => {
        await renderHomeAndWaitData();

        const userMetrics = screen.getByRole('group', { name: 'Users' });
        const expectedUserMetrics = [
          ['Successful onboardings', '0'],
          ['Failed onboardings', '0'],
          ['Incomplete onboardings', '0'],
          ['Total onboardings', '0'],
          ['Pass rate', '0%'],
          ['New vaults', '0'],
        ];
        expectedUserMetrics.forEach(([name, value]) => {
          const metric = within(userMetrics).getByRole('region', { name });
          expect(within(metric).getByText(value)).toBeInTheDocument();
        });
      });
    });

    describe('when metric values are non-zero', () => {
      beforeEach(() => {
        withOrgMetrics();
      });

      it('should show all 6 user metrics and 6 busines metrics', async () => {
        await renderHomeAndWaitData();
        const metricBoxes = screen.getAllByRole('region');
        expect(metricBoxes).toHaveLength(12);

        const content = screen.getByRole('group', { name: 'Businesses' });
        expect(content).toBeInTheDocument();
      });

      it('should show the correct values', async () => {
        await renderHomeAndWaitData();

        const userMetrics = screen.getByRole('group', { name: 'Users' });
        const expectedUserMetrics = [
          ['Successful onboardings', '1,036,817'],
          ['Failed onboardings', '17,187'],
          ['Incomplete onboardings', '4,810'],
          ['Total onboardings', '1,058,814'],
          ['Pass rate', '98.4%'],
          ['New vaults', '8,910'],
        ];
        expectedUserMetrics.forEach(([name, value]) => {
          const metric = within(userMetrics).getByRole('region', { name });
          expect(within(metric).getByText(value)).toBeInTheDocument();
        });

        const businessMetrics = screen.getByRole('group', { name: 'Businesses' });
        const expectedBusinessMetrics = [
          ['Successful onboardings', '11'],
          ['Failed onboardings', '4'],
          ['Incomplete onboardings', '5'],
          ['Total onboardings', '20'],
          ['Pass rate', '73.3%'],
          ['New vaults', '30'],
        ];
        expectedBusinessMetrics.forEach(([name, value]) => {
          const metric = within(businessMetrics).getByRole('region', { name });
          expect(within(metric).getByText(value)).toBeInTheDocument();
        });
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
