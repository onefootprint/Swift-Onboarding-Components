import { customRender, mockRouter, screen, userEvent, waitFor } from '@onefootprint/test-utils';
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
jest.mock('next/router', () => jest.requireActual('next-router-mock'));

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
      mockRouter.setCurrentUrl(`/lists/${listId}`);
      mockRouter.query = {
        id: listId,
      };
      withListEntries(listId);
    });

    it('should clear the filter', async () => {
      mockRouter.setCurrentUrl(`/lists/${listId}`);
      mockRouter.query = {
        id: listId,
        search: 'test2',
      };
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

      expect(mockRouter).toMatchObject({
        query: {
          id: listId,
        },
      });
    });
  });

  describe('When filtering entries', () => {
    beforeEach(() => {
      withListEntries(listId);
    });

    it('should filter the entries', async () => {
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
        expect(mockRouter).toMatchObject({
          query: {
            id: listId,
            search: '2',
          },
        });
      });
    });
  });

  describe('When fetching entries succeeds', () => {
    beforeEach(() => {
      withListEntries(listId);
      mockRouter.setCurrentUrl(`/lists/${listId}`);
      mockRouter.query = {
        id: listId,
      };
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
