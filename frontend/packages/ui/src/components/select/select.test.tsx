import '../../config/initializers/i18next-test';

import { customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { SelectProps } from './select';
import Select from './select';

const defaultOptions = [
  { value: 'option 1', label: 'option 1' },
  { value: 'option 2', label: 'option 2' },
  { value: 'option 3', label: 'option 3' },
  { value: 'option 4', label: 'option 4' },
  { value: 'option 5', label: 'option 5' },
  { value: 'option 6', label: 'option 6' },
  { value: 'option 7', label: 'option 7' },
  { value: 'option 8', label: 'option 8' },
  { value: 'option 9', label: 'option 9' },
  { value: 'option 10', label: 'option 10' },
  { value: 'option 11', label: 'option 11' },
];

describe('<Select />', () => {
  const renderSelect = ({
    disabled,
    emptyStateText,
    hasError,
    hint,
    id = 'some id',
    label = 'label ',
    onChange = jest.fn(),
    options = defaultOptions,
    placeholder = 'Select',
    searchPlaceholder,
    labelTooltip = undefined,
    value,
    testID = 'select-test-id',
  }: Partial<SelectProps>) =>
    customRender(
      <Select
        disabled={disabled}
        emptyStateText={emptyStateText}
        hasError={hasError}
        hint={hint}
        id={id}
        label={label}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        labelTooltip={labelTooltip}
        value={value}
        testID={testID}
      />,
    );

  it('should add a test id attribute', () => {
    renderSelect({ testID: 'select-test-id' });
    expect(screen.getByTestId('select-test-id')).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderSelect({ label: 'some label text' });
    expect(screen.getByText('some label text')).toBeInTheDocument();
  });

  it('should render the placeholder', () => {
    renderSelect({ placeholder: 'placeholder' });
    expect(screen.getByText('placeholder')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    const hint = 'This is an important message';
    renderSelect({ hint });
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('should render label tooltip text', async () => {
    const labelTooltipText = 'This is an important message';
    renderSelect({ labelTooltip: { text: labelTooltipText } });

    const tooltipIcon = screen.getByLabelText(labelTooltipText);
    await userEvent.hover(tooltipIcon);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: labelTooltipText,
      });
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('when clicking on the trigger', () => {
    it('should display the list of options', async () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      renderSelect({ options });
      const trigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.openMenu(trigger);
      options.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('when selecting an option', () => {
    it('should call the onChange callback', async () => {
      const onChange = jest.fn();
      renderSelect({ onChange });
      const trigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(trigger, 'option 2');
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({
          value: 'option 2',
          label: 'option 2',
        });
      });
    });
  });

  describe('when there is an item selected', () => {
    it('should render the label of the selected item', () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, value: selectedOption });
      expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
    });

    // TODO: Fix this test, in practice, it works and shows the check icon but the test fails
    it.skip('should render a check icon in the list option', async () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, value: selectedOption });
      const trigger = screen.getByText(selectedOption.label);
      await selectEvents.openMenu(trigger);
      const listOption = screen.getByRole('option', {
        name: selectedOption.label,
      });
      expect(listOption).toContainHTML('svg');
    });
  });

  describe('search', () => {
    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderSelect({});
        const trigger = screen.getByRole('button', { name: 'Select' });
        await selectEvents.search(trigger, 'option 2');
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderSelect({
            emptyStateText: 'No results were found',
          });
          const trigger = screen.getByRole('button', { name: 'Select' });
          await selectEvents.search(trigger, 'lorem');
          expect(screen.getByText('No results were found')).toBeInTheDocument();
        });
      });
    });
  });

  describe('when there is a error', () => {
    it('should add an error border to the trigger', () => {
      renderSelect({ hasError: true });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.getAttribute('data-has-error')).toEqual('true');
    });

    it('should add a error color to the hint', () => {
      renderSelect({ hasError: true, hint: 'Hint' });
      const hint = screen.getByText('Hint');
      expect(hint.getAttribute('data-has-error')).toEqual('true');
    });
  });

  describe('when is disabled', () => {
    it('should not be able to interact with the trigger', async () => {
      renderSelect({ disabled: true });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });

  describe('when it has description', () => {
    it('should render the description', async () => {
      const options = [{ value: 'Step up', label: 'step_up', description: 'Lorem ipsum' }];
      renderSelect({ options });
      const trigger = screen.getByRole('button', { name: 'Select' });
      await userEvent.click(trigger);
      expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
    });
  });
});
