import {
  createUseRouterSpy,
  customRender,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser } from 'src/config/tests';

import Playbooks from './playbooks';
import {
  withListDetails,
  withListDetailsNoPlaybooks,
  withListError,
  withLists,
} from './playbooks.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Playbooks />', () => {
  const listId = 'list_1';
  const renderPlaybooks = () => customRender(<Playbooks />);

  beforeEach(() => {
    asAdminUser();
    withLists();
    useRouterSpy({
      pathname: `/lists/${listId}`,
      query: { id: listId },
    });
  });

  describe('when fetching list fails', () => {
    beforeEach(() => {
      withListError(listId);
    });

    it('should show an error message', async () => {
      renderPlaybooks();
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });

  describe('when list playbooks are empty', () => {
    beforeEach(() => {
      withListDetailsNoPlaybooks(listId);
    });

    it('should show an empty message', async () => {
      renderPlaybooks();

      await waitFor(() => {
        expect(
          screen.getByText('There are no playbooks using this list'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when rendering playbooks', () => {
    beforeEach(() => {
      withListDetails(listId);
    });

    it('should render the playbooks', async () => {
      renderPlaybooks();

      await waitFor(() => {
        expect(screen.getByText('Playbook 1')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Playbook 2')).toBeInTheDocument();
      });

      expect(screen.getByText('some_rule')).toBeInTheDocument();
      expect(screen.getByText('triggered')).toBeInTheDocument();
      expect(screen.getByText('id.email')).toBeInTheDocument();
      expect(screen.getByText('in')).toBeInTheDocument();
      expect(screen.getByText('list_1')).toBeInTheDocument();
    });
  });
});
