import {
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import PeopleTable from './people-table';
import OrgMembersFixture from './people-table.test.config';

describe('<PeopleTable />', () => {
  const renderPeopleTable = (
    members = OrgMembersFixture,
    isLoading = false,
    onFilter = jest.fn(),
  ) =>
    customRender(
      <PeopleTable
        members={members}
        isLoading={isLoading}
        onFilter={onFilter}
      />,
    );

  describe('when there are no members', () => {
    it('should render an empty table message', () => {
      renderPeopleTable([]);
      expect(screen.getByText('No members found')).toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    it('should render loading state', () => {
      renderPeopleTable([], true);
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toEqual('true');
    });
  });

  describe('when there are 1+ members', () => {
    it('should render the member rows', () => {
      renderPeopleTable();

      const row1 = screen.getByTestId('orguser_0WFrWMZwP0C65s21w9lBBy');
      expect(row1).toBeInTheDocument();
      expect(within(row1).getByText('Admin')).toBeInTheDocument();
      expect(within(row1).getByText('1 month ago')).toBeInTheDocument();

      const row2 = screen.getByTestId('orguser_034lwekfnwefwo3rBy');
      expect(row2).toBeInTheDocument();
      expect(within(row2).getByText('Admin')).toBeInTheDocument();
      expect(within(row2).getByText('2 days ago')).toBeInTheDocument();
    });
  });

  describe('when filtering', () => {
    describe('when typing on the table search', () => {
      it('should call onFilter with emails', async () => {
        const filterMockFn = jest.fn();

        renderPeopleTable(OrgMembersFixture, false, filterMockFn);
        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'lorem');
        await waitFor(() => {
          expect(filterMockFn).toHaveBeenCalledWith('lorem');
        });
      });
    });
  });
});
