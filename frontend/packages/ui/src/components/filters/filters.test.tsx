import '../../config/initializers/i18next-test';

import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import { customRender } from '../../utils/test-utils';

import type { FiltersProps } from './filters';
import Filters from './filters';

const testDate = new Date('2023-01-04');

describe('<Filters />', () => {
  beforeAll(() => {
    MockDate.set(testDate);
  });

  afterAll(() => {
    MockDate.reset();
  });

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
    onChange,
    onClear,
  }: Partial<FiltersProps>) => customRender(<Filters controls={controls} onChange={onChange} onClear={onClear} />);

  it('should not render the clear button when there is no selectedOption', () => {
    renderFilters({});
    const clearButton = screen.queryByRole('button', {
      name: 'Clear filters',
    });
    expect(clearButton).not.toBeInTheDocument();
  });

  describe('when there is a selectedOption', () => {
    it('should trigger onClear when clicking on the clear button', async () => {
      const onClear = jest.fn();
      renderFilters({
        onClear,
        controls: [
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
            selectedOptions: ['verified'],
          },
        ],
      });
      const clearButton = screen.getByRole('button', { name: 'Clear filters' });
      await userEvent.click(clearButton);
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('single-select variant', () => {
    const defaulOptions = [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ];

    const renderMultiSelectFilters = ({ onChange }: Partial<FiltersProps>) =>
      renderFilters({
        controls: [
          {
            query: 'watchlist_hit',
            label: 'On a watchlist',
            kind: 'single-select',
            options: defaulOptions,
            selectedOptions: undefined,
          },
        ],
        onChange,
      });

    describe('when clicking on the filter label', () => {
      it('should open the popover and display the options', async () => {
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'On a watchlist' });
        await userEvent.click(trigger);

        const popover = screen.getByRole('dialog');
        defaulOptions.forEach(option => {
          const radio = within(popover).getByRole('radio', {
            name: option.label,
          });
          expect(radio).toBeInTheDocument();
        });
      });
    });

    describe('when selecting an option', () => {
      it('should trigger onChange with the selected option and close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const trigger = screen.getByRole('button', { name: 'On a watchlist' });
        await userEvent.click(trigger);

        const firstRadioOption = screen.getByRole('radio', {
          name: 'Yes',
        });
        await userEvent.click(firstRadioOption);

        const submitButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(submitButton);

        expect(onChange).toHaveBeenCalledWith('watchlist_hit', 'true');

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should close the popover', async () => {
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'On a watchlist' });
        await userEvent.click(trigger);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });
  });

  describe('multi-select variant', () => {
    const defaulOptions = [
      { label: 'Verified', value: 'verified' },
      { label: 'Failed', value: 'failed' },
      { label: 'Review required', value: 'review_required' },
      { label: 'Id required', value: 'id_required' },
    ];

    const renderMultiSelectFilters = ({ onChange }: Partial<FiltersProps>) =>
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

    describe('when clicking on the filter label', () => {
      it('should open the popover and display the options', async () => {
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(trigger);

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
      it('should trigger onChange with the selected option and close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const trigger = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(trigger);

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
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'Status' });
        await userEvent.click(trigger);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

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
          { label: 'Phone number', value: 'phone_number' },
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
      it('should open the popover and display the options', async () => {
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'Attributes' });
        await userEvent.click(trigger);

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

    describe('when the filter is loading', () => {
      it('should show a loading spinner', async () => {
        renderFilters({
          controls: [
            {
              kind: 'multi-select-grouped',
              label: 'Attributes',
              loading: true,
              options: defaulOptions,
              query: 'attributes',
              selectedOptions: [],
            },
          ],
        });

        const trigger = screen.getByRole('button', { name: 'Attributes' });
        await userEvent.click(trigger);

        const loading = screen.getByRole('progressbar', {
          name: 'Loading Attributes',
        });
        expect(loading).toBeInTheDocument();
      });
    });

    describe('when selecting an option', () => {
      it('should trigger onChange with the selected option and close the popover', async () => {
        const onChange = jest.fn();
        renderMultiSelectFilters({ onChange });

        const trigger = screen.getByRole('button', {
          name: 'Attributes',
        });
        await userEvent.click(trigger);

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
        renderMultiSelectFilters({});

        const trigger = screen.getByRole('button', { name: 'Attributes' });
        await userEvent.click(trigger);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });
  });

  describe('date variant', () => {
    const renderDateFilter = ({ onChange }: Partial<FiltersProps>) =>
      renderFilters({
        controls: [
          {
            query: 'date',
            label: 'Date',
            kind: 'date',
            selectedOptions: [],
          },
        ],
        onChange,
      });

    describe('when clicking on the filter label', () => {
      it('should open the popover and display the options', async () => {
        renderDateFilter({});

        const trigger = screen.getByRole('button', { name: 'Date' });
        await userEvent.click(trigger);

        const popover = screen.getByRole('dialog');
        expect(popover).toBeInTheDocument();

        const allTime = screen.getByRole('radio', { name: 'All time' });
        expect(allTime).toBeInTheDocument();

        const today = screen.getByRole('radio', { name: 'Today' });
        expect(today).toBeInTheDocument();

        const last7Days = screen.getByRole('radio', { name: 'Last 7 days' });
        expect(last7Days).toBeInTheDocument();

        const last30Days = screen.getByRole('radio', {
          name: 'Last 30 days',
        });
        expect(last30Days).toBeInTheDocument();

        const custom = screen.getByRole('radio', { name: 'Custom' });
        expect(custom).toBeInTheDocument();
      });
    });

    describe('when selecting an option', () => {
      it('should trigger onChange with the selected option and close the popover', async () => {
        const onChange = jest.fn();
        renderDateFilter({ onChange });

        const trigger = screen.getByRole('button', { name: 'Date' });
        await userEvent.click(trigger);

        await waitFor(() => {
          const popover = screen.getByRole('dialog');
          expect(popover).toBeInTheDocument();
        });

        const today = screen.getByRole('radio', { name: 'Today' });
        await userEvent.click(today);

        const submitButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(submitButton);
        expect(onChange).toHaveBeenCalledWith('date', ['today']);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });

    describe.skip('when selecing the custom option', () => {
      it('should trigger onChange with the dates and close the popover', async () => {
        const onChange = jest.fn();
        renderDateFilter({ onChange });

        const trigger = screen.getByRole('button', { name: 'Date' });
        await userEvent.click(trigger);

        await waitFor(() => {
          const popover = screen.getByRole('dialog');
          expect(popover).toBeInTheDocument();
        });

        const custom = screen.getByRole('radio', { name: 'Custom' });
        await userEvent.click(custom);

        const calendarTrigger = screen.getByRole('button', {
          name: '1/4/2023',
        });
        await userEvent.click(calendarTrigger);

        const day5 = screen.getByRole('button', {
          name: '5th January (Thursday)',
        });
        await userEvent.click(day5);

        const day12 = screen.getByRole('button', {
          name: '12th January (Thursday)',
        });
        await userEvent.click(day12);

        const submitButton = screen.getByRole('button', { name: 'Apply' });
        await userEvent.click(submitButton);
        expect(onChange).toHaveBeenCalledWith('date', ['2023-01-05T00:00:00.000Z', '2023-01-12T00:00:00.000Z']);

        await waitForElementToBeRemoved(screen.queryByRole('dialog'));
        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });

    describe('when clicking on the cancel button', () => {
      it('should close the popover', async () => {
        renderDateFilter({});

        const trigger = screen.getByRole('button', { name: 'Date' });
        await userEvent.click(trigger);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        await userEvent.click(cancelButton);

        const popover = screen.queryByRole('dialog');
        expect(popover).not.toBeInTheDocument();
      });
    });
  });

  describe('when it is disabled', () => {
    it('should not open the popover when clicking on the filter label', async () => {
      renderFilters({
        controls: [
          {
            query: 'status',
            label: 'Status',
            kind: 'multi-select',
            disabled: true,
            options: [
              { label: 'Verified', value: 'verified' },
              { label: 'Failed', value: 'failed' },
              { label: 'Review required', value: 'review_required' },
              { label: 'Id required', value: 'id_required' },
            ],
            selectedOptions: [],
          },
        ],
      });

      const trigger = screen.getByRole('button', { name: 'Status' });
      await userEvent.click(trigger);

      const popover = screen.queryByRole('dialog');
      expect(popover).not.toBeInTheDocument();
    });
  });
});
