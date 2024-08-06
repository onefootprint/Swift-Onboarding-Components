import {
  createUseRouterSpy,
  customRender,
  filterEvents,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import { EntityKind } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

import Table from '../table';
import List from './list';
import { entitiesFixture, withEntities, withEntitiesError } from './list.test.config';

const useRouterSpy = createUseRouterSpy();

describe.skip('<List />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: '/entities',
      query: {},
    });
  });

  afterAll(() => {
    resetUser();
  });

  const renderEntities = () => {
    const columns = [
      { text: 'Token', width: '50%' },
      { text: 'Start', width: '50%' },
    ];

    return customRender(
      <List title="Entities list" kind={EntityKind.business} basePath="entities">
        <Table
          aria-label="Entities table"
          searchPlaceholder="Search..."
          columns={columns}
          emptyStateText="No results found"
          renderTr={entity => (
            <>
              <td>{entity.id}</td>
              <td>{entity.startTimestamp}</td>
            </>
          )}
        />
      </List>,
    );
  };

  const renderEntitiesAndWaitData = async () => {
    renderEntities();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch the entities succeeds', () => {
    beforeEach(() => {
      withEntities();
    });

    it('should show an empty state if no results are found', async () => {
      withEntities([]);
      renderEntities();

      await waitFor(() => {
        const feedback = screen.getByText('No results found');
        expect(feedback).toBeInTheDocument();
      });
    });

    it('should show the entity id, name and status', async () => {
      await renderEntitiesAndWaitData();

      entitiesFixture.forEach(entity => {
        const row = screen.getByRole('row', { name: entity.id });

        const id = within(row).getByText(entity.id);
        expect(id).toBeInTheDocument();

        const startTimestamp = within(row).getByText(entity.startTimestamp);
        expect(startTimestamp).toBeInTheDocument();
      });
    });

    describe('when clicking on the row', () => {
      it('should redirect to the entity details page', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/entities',
          push,
          query: {},
        });
        await renderEntitiesAndWaitData();

        const [firstResult] = entitiesFixture;
        const row = screen.getByRole('row', {
          name: firstResult.id,
        });
        await userEvent.click(row);

        expect(push).toHaveBeenCalledWith({
          pathname: `/entities/${firstResult.id}`,
          query: {},
        });
      });
    });

    describe('when typing on the search', () => {
      it('should apply the "entities_search" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/entities',
          push,
          query: {},
        });
        await renderEntitiesAndWaitData();

        const searchField = screen.getByPlaceholderText('Search...');
        await userEvent.type(searchField, 'Koch Inc');

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith({ query: { search: 'Koch Inc' } }, undefined, expect.anything());
        });
      });
    });

    describe('when filtering by "status"', () => {
      it('should apply the "status" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/entities',
          push,
          query: {},
        });
        await renderEntitiesAndWaitData();

        await filterEvents.apply({
          trigger: 'Status',
          options: ['Failed'],
        });

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith({ query: { status: ['fail'] } }, undefined, expect.anything());
        });
      });
    });

    describe('when filtering by "date range"', () => {
      it('should apply the "date_range" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/entities',
          push,
          query: {},
        });
        await renderEntitiesAndWaitData();

        await filterEvents.apply({
          trigger: 'Date range',
          options: ['Last 7 days'],
        });

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith({ query: { date_range: ['last-7-days'] } }, undefined, expect.anything());
        });
      });
    });

    describe('when filtering by "On a watchlist"', () => {
      it('should apply the "watchlist_hit" in the url', async () => {
        const push = jest.fn();
        useRouterSpy({
          pathname: '/entities',
          push,
          query: {},
        });
        await renderEntitiesAndWaitData();

        await filterEvents.apply({
          trigger: 'On a watchlist',
          options: ['Yes'],
        });

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith({ query: { watchlist_hit: 'true' } }, undefined, expect.anything());
        });
      });
    });
  });

  describe('when filtering by "Requires manual review"', () => {
    it.skip('should apply the "requires_manual_review" in the url', async () => {
      withEntities();
      const push = jest.fn();
      useRouterSpy({
        pathname: '/entities',
        push,
        query: {},
      });
      await renderEntitiesAndWaitData();

      await filterEvents.apply({
        trigger: 'Requires manual review',
        options: ['Yes'],
      });

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith({ query: { requires_manual_review: 'true' } }, undefined, expect.anything());
      });
    });
  });

  describe('when the request to fetch the entities fails', () => {
    beforeEach(() => {
      withEntitiesError();
    });

    it('should show an error message', async () => {
      renderEntities();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
