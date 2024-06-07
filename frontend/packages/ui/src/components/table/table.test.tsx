import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { TableProps } from './table';
import Table from './table';

describe('<Table />', () => {
  const renderTable = ({
    getAriaLabelForRow,
    hideThead,
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
    searchPlaceholder,
    onChangeSearchText,
  }: Partial<TableProps<{ id: string; name: string; age: number }>>) =>
    customRender(
      <Table
        aria-label={ariaLabel}
        columns={columns}
        emptyStateText={emptyStateText}
        getAriaLabelForRow={getAriaLabelForRow}
        getKeyForRow={item => item.id}
        hideThead={hideThead}
        isLoading={isLoading}
        items={items}
        onChangeSearchText={onChangeSearchText}
        onRowClick={onRowClick}
        searchPlaceholder={searchPlaceholder}
        renderTr={() => (
          <>
            <td aria-label="test 1" />
            <td aria-label="test 2" />
          </>
        )}
      />,
    );

  describe('<Table />', () => {
    it('should render the aria-label', () => {
      renderTable({ 'aria-label': 'Users table' });
      expect(screen.getByLabelText('Users table')).toBeInTheDocument();
    });

    describe('when it is loading', () => {
      it('should show a loading indicator', () => {
        renderTable({ isLoading: true });
        expect(screen.getByRole('table').getAttribute('aria-busy')).toBeTruthy();
      });
    });

    describe('when it does not have results', () => {
      it('should show an empty state', () => {
        renderTable({ items: [], emptyStateText: 'No results found' });
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    describe('when hideThead is set', () => {
      it('should not render the table head', () => {
        renderTable({
          'aria-label': 'table',
          items: [],
          emptyStateText: 'No results found',
          hideThead: true,
        });
        const table = screen.getByLabelText('table');
        expect(table.querySelector('thead')).not.toBeInTheDocument();
      });
    });

    describe('when it has a custom search placeholder', () => {
      it('should render the custom placeholder', () => {
        renderTable({
          searchPlaceholder: 'Search by name',
          onChangeSearchText: () => undefined,
        });

        const search = screen.getByPlaceholderText('Search by name');
        expect(search).toBeInTheDocument();
      });
    });

    describe('when it has getAriaLabelForRow', () => {
      it('should be able to get a specific row by name', () => {
        renderTable({
          items: [
            { id: '1', name: 'John Doe', age: 32 },
            { id: '2', name: 'Jane Doe', age: 31 },
          ],
          getAriaLabelForRow: item => item.name,
        });

        const row = screen.getByRole('row', { name: 'John Doe' });
        expect(row).toBeInTheDocument();
      });
    });

    describe('when has tooltip', () => {
      it('should properly display tooltip text when clicking', async () => {
        renderTable({
          columns: [
            { text: 'Name', width: '50%' },
            {
              text: 'Age',
              width: '50%',
              tooltip: {
                triggerAriaLabel: 'Additional age info',
                text: 'Age is how old you are',
              },
            },
          ],
        });

        const icon = screen.getByLabelText('Additional age info');
        await userEvent.hover(icon);

        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip', {
            name: 'Age is how old you are',
          });
          expect(tooltip).toBeInTheDocument();
        });
      });

      it('should use text as trigger aria label when no aria label provided', async () => {
        renderTable({
          columns: [
            { text: 'Name', width: '50%' },
            {
              text: 'Age',
              width: '50%',
              tooltip: {
                text: 'Age is how old you are',
              },
            },
          ],
        });

        const icon = screen.getByLabelText('Age is how old you are');
        await userEvent.hover(icon);

        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip', {
            name: 'Age is how old you are',
          });
          expect(tooltip).toBeInTheDocument();
        });
      });
    });
  });
});
