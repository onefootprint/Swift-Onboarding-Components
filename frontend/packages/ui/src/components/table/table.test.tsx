import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Table, { TableProps } from './table';

describe('<Table />', () => {
  const renderTab = ({
    'aria-label': ariaLabel = 'Table',
    onRowClick,
    emptyStateText,
    isLoading = false,
    items = [
      { id: '1', name: 'John Doe', age: 32 },
      { id: '2', name: 'Jane Doe', age: 31 },
    ],
    columns = [
      { text: 'Name', width: '50%' },
      { text: 'Age', width: '50%' },
    ],
  }: Partial<TableProps<{ id: string; name: string; age: number }>>) =>
    customRender(
      <Table
        aria-label={ariaLabel}
        columns={columns}
        emptyStateText={emptyStateText}
        getKeyForRow={(item: any) => item.id}
        isLoading={isLoading}
        items={items}
        onRowClick={onRowClick}
        renderTr={() => (
          <>
            <td />
            <td />
          </>
        )}
      />,
    );

  describe('<Table />', () => {
    it('should render the aria-label', () => {
      renderTab({ 'aria-label': 'Users table' });
      expect(screen.getByLabelText('Users table')).toBeInTheDocument();
    });

    describe('when it is loading', () => {
      it('should show a loading indicator', () => {
        renderTab({ isLoading: true });
        expect(
          screen.getByRole('table').getAttribute('aria-busy'),
        ).toBeTruthy();
      });
    });

    describe('when it does not have results', () => {
      it('should show an empty state', () => {
        renderTab({ items: [], emptyStateText: 'No results found' });
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });
});
