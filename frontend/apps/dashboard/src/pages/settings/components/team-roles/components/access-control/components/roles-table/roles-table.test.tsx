import {
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import RolesTable from './roles-table';
import OrgRolesFixture from './roles-table.test.config';

describe('<RolesTable />', () => {
  const renderRolesTable = (
    roles = OrgRolesFixture,
    isLoading = false,
    onFilter = jest.fn(),
  ) =>
    customRender(
      <RolesTable roles={roles} isLoading={isLoading} onFilter={onFilter} />,
    );

  describe('when there are no roles', () => {
    it('should render an empty table message', () => {
      renderRolesTable([]);
      expect(screen.getByText('No roles found')).toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    it('should render loading state', () => {
      renderRolesTable([], true);
      const table = screen.getByRole('table');
      const isLoading = table.getAttribute('aria-busy');
      expect(isLoading).toEqual('true');
    });
  });

  describe('when there are 1+ roles', () => {
    it('should render the roles rows', () => {
      renderRolesTable();

      const row1 = screen.getByTestId('orgrole_aExxJ6XgSBpvqIJ2VcHH6J');
      expect(row1).toBeInTheDocument();
      expect(within(row1).getByText('Admin')).toBeInTheDocument();
      expect(within(row1).getByText('API keys')).toBeInTheDocument();
      expect(within(row1).getByText('9/19/22, 12:24 PM')).toBeInTheDocument();

      const row2 = screen.getByTestId('orgrole_erflKNWEF13143EWRWELJN');
      expect(row2).toBeInTheDocument();
      expect(within(row2).getByText('Member')).toBeInTheDocument();
      expect(
        within(row2).getByText('View user list & details'),
      ).toBeInTheDocument();
      expect(within(row2).getByText('8/12/22, 11:29 PM')).toBeInTheDocument();
    });
  });

  describe('when filtering', () => {
    describe('when typing on the table search', () => {
      it('should call onFilter with role', async () => {
        const filterMockFn = jest.fn();

        renderRolesTable(OrgRolesFixture, false, filterMockFn);
        const search = screen.getByPlaceholderText('Search...');
        await userEvent.type(search, 'lorem');
        await waitFor(() => {
          expect(filterMockFn).toHaveBeenCalledWith('lorem');
        });
      });
    });
  });
});
