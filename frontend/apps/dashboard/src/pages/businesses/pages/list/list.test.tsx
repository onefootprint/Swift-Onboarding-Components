import {
  createUseRouterSpy,
  customRender,
  filterEvents,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import { BusinessDI, VaultTextData } from '@onefootprint/types';
import React from 'react';

import ProxyConfigs from './list';
import {
  entitiesFixture,
  entitiesFormattedFixture,
  withEntities,
  withEntitiesError,
} from './list.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<List />', () => {
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
      withEntities();
    });

    it('should show an empty state if no results are found', async () => {
      withEntities([]);
      renderBusinesses();

      await waitFor(() => {
        const feedback = screen.getByText('No businesses found');
        expect(feedback).toBeInTheDocument();
      });
    });

    it('should show the business id, name and status', async () => {
      await renderBusinessesAndWaitData();

      entitiesFixture.forEach((business, index) => {
        const formattedValues = entitiesFormattedFixture[index];
        const row = screen.getByRole('row', { name: business.id });

        const id = within(row).getByText(business.id);
        expect(id).toBeInTheDocument();

        const name = within(row).getByText(
          business.decryptedAttributes[BusinessDI.name] as VaultTextData,
        );
        expect(name).toBeInTheDocument();

        const status = within(row).getByText(formattedValues.status);
        expect(status).toBeInTheDocument();
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

        const [firstResult] = entitiesFixture;
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
            { query: { search: 'Koch Inc' } },
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
      withEntitiesError();
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
