import { createUseRouterSpy, customRender, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import List from './list';
import { withLists, withListsError } from './list.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<List />', () => {
  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: '/lists',
      query: {},
    });
  });

  const renderList = () => customRender(<List />);

  const renderListAndWait = async () => {
    renderList();

    await waitFor(() => {
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toBe('false');
    });
  };

  describe('when the request to fetch lists succeeds', () => {
    beforeEach(() => {
      withLists();
    });

    it.each([
      {
        name: 'Email List',
        alias: 'my_list',
      },
      {
        name: 'SSN List',
        alias: 'my_list2',
      },
    ])(`should render the name and alias`, async ({ name, alias }) => {
      await renderListAndWait();

      const rowName = screen.getByText(name);
      expect(rowName).toBeInTheDocument();

      const rowAlias = screen.getByText(alias);
      expect(rowAlias).toBeInTheDocument();
    });
  });

  describe('when the request to fetch lists fails', () => {
    beforeEach(() => {
      withListsError();
    });

    it('should show an error message', async () => {
      renderList();

      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
