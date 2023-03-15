import {
  createUseRouterSpy,
  customRender,
  filterEvents,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import ProxyConfigs from './businesses';
import {
  businessesListFixture,
  businessListFormattedFixture,
  withBusinesses,
  withBusinessesError,
} from './businesses.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Businesses />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/businesses',
      query: {},
    });
  });

  const renderBusinesses = () => customRender(<ProxyConfigs />);

  const renderBusinessesAndWaitData = async () => {
    renderBusinesses();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the proxy configs succeeds', () => {
    beforeEach(() => {
      withBusinesses();
    });

    it('should show an empty state if no results are found', async () => {
      withBusinesses([]);
      renderBusinesses();

      await waitFor(() => {
        const feedback = screen.getByText('No businesses found');
        expect(feedback).toBeInTheDocument();
      });
    });

    it('should show the business name, id, status and start time', async () => {
      await renderBusinessesAndWaitData();

      businessesListFixture.forEach((business, index) => {
        const formattedValues = businessListFormattedFixture[index];
        const row = screen.getByRole('row', { name: business.id });

        const id = within(row).getByText(business.id);
        expect(id).toBeInTheDocument();

        // TODO: add once we don't use faker anymore
        // https://linear.app/footprint/issue/FP-3090/business-list-use-correct-endpoint
        // const name = screen.getByText(business.name);
        // expect(name).toBeInTheDocument();

        const status = within(row).getByText(formattedValues.status);
        expect(status).toBeInTheDocument();

        const start = within(row).getByText(formattedValues.startTimestamp);
        expect(start).toBeInTheDocument();
      });
    });

    describe('when clicking on the row', () => {
      it('should redirect to the business details page', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/businesses',
          push,
          query: {},
        });
        await renderBusinessesAndWaitData();

        const [firstResult] = businessesListFixture;
        const row = screen.getByRole('row', {
          name: firstResult.id,
        });
        await userEvent.click(row);

        expect(push).toHaveBeenCalledWith({
          pathname: `/businesses/${firstResult.id}`,
        });
      });
    });

    describe('when typing on the search', () => {
      it('should apply the "businesses_search" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/businesses',
          push,
          query: {},
        });
        await renderBusinessesAndWaitData();

        const searchField = screen.getByPlaceholderText('Search...');
        await userEvent.type(searchField, 'Koch Inc');

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            { query: { businesses_search: 'Koch Inc' } },
            undefined,
            expect.anything(),
          );
        });
      });
    });

    describe('when filtering by "status"', () => {
      it('should apply the "businesses_status" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/businesses',
          push,
          query: {},
        });
        await renderBusinessesAndWaitData();

        await filterEvents.apply({
          trigger: 'Status',
          option: 'Failed',
        });

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            { query: { businesses_status: ['fail'] } },
            undefined,
            expect.anything(),
          );
        });
      });
    });

    describe('when filtering by "date range"', () => {
      it('should apply the "businesses_date_range" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/businesses',
          push,
          query: {},
        });
        await renderBusinessesAndWaitData();

        await filterEvents.apply({
          trigger: 'Date range',
          option: 'Last 7 days',
        });

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(
            { query: { businesses_date_range: ['last-7-days'] } },
            undefined,
            expect.anything(),
          );
        });
      });
    });
  });

  describe('when the request to fetch the proxy configs fails', () => {
    beforeEach(() => {
      withBusinessesError();
    });

    it('should show an error message', async () => {
      renderBusinesses();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
