import { createUseRouterSpy, customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import Entries from './entries';
import {
  entriesFixture,
  withDelete,
  withDeleteError,
  withListDetails,
  withListEntries,
  withListEntriesError,
} from './entries.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Entries />', () => {
  const renderEntries = () => customRender(<Entries />);
  const listId = 'list_1';
  const entryId = 'entry_1';

  beforeEach(() => {
    asAdminUser();
    withListDetails(listId);
  });

  describe('When clearing filter', () => {
    beforeEach(() => {
      withListEntries(listId);
    });

    it('should clear the filter', async () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId, search: 'test2' },
        push: pushMockFn,
      });

      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('test2@onefootprint.com')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByText('test@onefootprint.com')).toBe(null);
      });

      const searchInput = screen.getByPlaceholderText('Find...') as HTMLInputElement;
      await waitFor(() => {
        expect(searchInput).toHaveValue('test2');
      });

      await userEvent.clear(searchInput);

      expect(pushMockFn).toHaveBeenCalledWith(
        {
          query: {
            search: undefined,
            id: listId,
          },
        },
        undefined,
        { shallow: true },
      );
    });
  });

  describe('When filtering entries', () => {
    beforeEach(() => {
      withListEntries(listId);
    });

    it('should filter the entries', async () => {
      const pushMockFn = jest.fn();
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId },
        push: pushMockFn,
      });

      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('test@onefootprint.com')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('test2@onefootprint.com')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Find...');
      await userEvent.type(searchInput, '2');

      await waitFor(() => {
        expect(pushMockFn).toHaveBeenCalledWith(
          {
            query: {
              id: listId,
              search: '2',
            },
          },
          undefined,
          { shallow: true },
        );
      });
    });
  });

  describe('When fetching entries succeeds', () => {
    beforeEach(() => {
      withListEntries(listId);
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId },
      });
    });

    it('should render the entries', async () => {
      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('test@onefootprint.com')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('test2@onefootprint.com')).toBeInTheDocument();
      });
    });
  });

  describe('When fetching entries fails', () => {
    beforeEach(() => {
      withListEntriesError(listId);
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId },
      });
    });

    it('should render the error message', async () => {
      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('When deleting errors', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId },
      });
      withListEntries(listId);
      withDeleteError(listId, entryId);
    });

    it('should show an error toast if the deletion fails', async () => {
      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('test@onefootprint.com')).toBeInTheDocument();
      });

      withListEntriesError(listId);

      await userEvent.click(screen.getByRole('button', { name: 'Delete test@onefootprint.com' }));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('When deleting succeeds', () => {
    beforeEach(() => {
      useRouterSpy({
        pathname: `/lists/${listId}`,
        query: { id: listId },
      });
      withListEntries(listId);
      withDelete(listId, entryId);
    });

    it('should remove the entry', async () => {
      renderEntries();

      await waitFor(() => {
        expect(screen.getByText('test@onefootprint.com')).toBeInTheDocument();
      });

      withListEntries(listId, entriesFixture.slice(1));
      await userEvent.click(screen.getByRole('button', { name: 'Delete test@onefootprint.com' }));

      await waitFor(() => {
        expect(screen.getByText('Deletion successful')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByText('test@onefootprint.com')).not.toBeInTheDocument();
      });
    });
  });
});
