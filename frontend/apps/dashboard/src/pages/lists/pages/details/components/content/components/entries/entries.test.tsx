import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Entries from './entries';
import {
  withList,
  withListEntries,
  withListEntriesError,
} from './entries.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Entries />', () => {
  const renderEntries = () => customRender(<Entries />);
  const listId = 'list_id_123';

  beforeEach(() => {
    withList(listId);
    useRouterSpy({
      pathname: `/lists/${listId}`,
      query: { id: listId },
    });
  });

  describe('When fetching entries succeeds', () => {
    beforeEach(() => {
      withListEntries(listId);
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
});
