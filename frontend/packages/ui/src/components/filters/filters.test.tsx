import {
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
import React from 'react';

import Filters, { FiltersProps } from './filters';

describe('<Filters />', () => {
  const renderFilters = ({
    controls = [
      {
        query: 'status',
        label: 'Status',
        kind: 'multi-select',
        options: [
          { label: 'Verified', value: 'verified' },
          { label: 'Failed', value: 'failed' },
          { label: 'Review required', value: 'review_required' },
          { label: 'Id required', value: 'id_required' },
        ],
        selectedOptions: [],
      },
    ],
    label = 'Filter by',
    onChange,
    primaryButtonLabel = 'Apply',
    secondaryButtonLabel = 'Cancel',
  }: Partial<FiltersProps>) =>
    customRender(
      <Filters
        controls={controls}
        label={label}
        onChange={onChange}
        primaryButtonLabel={primaryButtonLabel}
        secondaryButtonLabel={secondaryButtonLabel}
      />,
    );

  it('should render the label', () => {
    renderFilters({ label: 'Filter by' });
    const label = screen.getByText('Filter by');

    expect(label).toBeInTheDocument();
  });

  describe('multi-select variant', () => {
    const defaulOptions = [
      { label: 'Verified', value: 'verified' },
      { label: 'Failed', value: 'failed' },
      { label: 'Review required', value: 'review_required' },
      { label: 'Id required', value: 'id_required' },
    ];

    const renderMultiSelectFilters = ({ onChange }: Partial<FiltersProps>) => {
      renderFilters({
        controls: [
          {
            query: 'status',
            label: 'Status',
            kind: 'multi-select',
            options: defaulOptions,
            selectedOptions: [],
          },
        ],
        onChange,
      });
    };

    describe('when clicking on the filter label', () => {
      it('should open the popover with the options', async () => {
        renderMultiSelectFilters({});

        const filterButton = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(filterButton);

        const popover = screen.getByRole('dialog');
        defaulOptions.forEach(option => {
          const checkbox = within(popover).getByRole('checkbox', {
            name: option.label,
          });
          expect(checkbox).toBeInTheDocument();
        });
      });
    });

    describe('when selecting an option', () => {
      it('should trigger onChange and close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const filterButton = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(filterButton);

        const firstCheckbox = screen.getByRole('checkbox', {
          name: 'Verified',
        });
        await userEvent.click(firstCheckbox);

        const submitButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(submitButton);

        expect(onChange).toHaveBeenCalledWith('status', ['verified']);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const filterButton = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(filterButton);

        const cancelButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(cancelButton);
        expect(onChange).toHaveBeenCalledWith('status', []);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });
  });

  describe('multi-select-grouped variant', () => {
    const defaulOptions = [
      {
        label: 'Basic Data',
        options: [
          { label: 'Full name', value: 'full_name' },
          { label: 'Email', value: 'email' },
          { label: 'Phone Number', value: 'phone_number' },
        ],
      },
    ];

    const renderMultiSelectFilters = ({ onChange }: Partial<FiltersProps>) => {
      renderFilters({
        controls: [
          {
            query: 'attributes',
            label: 'Attributes',
            kind: 'multi-select-grouped',
            options: defaulOptions,
            selectedOptions: [],
          },
        ],
        onChange,
      });
    };

    describe('when clicking on the filter label', () => {
      it('should open the popover with the options', async () => {
        renderMultiSelectFilters({});

        const filterButton = screen.getByRole('button', { name: 'Attributes' });
        await userEvent.click(filterButton);

        const popover = screen.getByRole('dialog');
        defaulOptions.forEach(group => {
          const groupLabel = within(popover).getByText(group.label);
          expect(groupLabel).toBeInTheDocument();

          group.options.forEach(option => {
            const checkbox = within(popover).getByRole('checkbox', {
              name: option.label,
            });
            expect(checkbox).toBeInTheDocument();
          });
        });
      });
    });

    describe('when selecting an option', () => {
      it('should trigger onChange and close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const filterButton = screen.getByRole('button', {
          name: 'Attributes',
        });
        await userEvent.click(filterButton);

        const firstCheckbox = screen.getByRole('checkbox', {
          name: 'Full name',
        });
        await userEvent.click(firstCheckbox);

        const submitButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(submitButton);

        expect(onChange).toHaveBeenCalledWith('attributes', ['full_name']);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const filterButton = screen.getByRole('button', {
          name: 'Attributes',
        });
        await userEvent.click(filterButton);

        const cancelButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(cancelButton);
        expect(onChange).toHaveBeenCalledWith('attributes', []);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });
  });
});
