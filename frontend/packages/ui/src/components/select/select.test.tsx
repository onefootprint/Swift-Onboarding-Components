import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import themes from '@onefootprint/themes';
import React from 'react';

import Select, { SelectProps } from './select';

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
];

describe('<Select />', () => {
  const renderSelect = ({
    disabled,
    emptyStateText,
    hasError,
    hint,
    id = 'some id',
    label = 'label text',
    onChange = jest.fn(),
    options = defaultOptions,
    placeholder = 'Select',
    searchPlaceholder,
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

  describe('when there is NO item selected', () => {
    it('should render the placeholder', () => {
      renderSelect({ placeholder: 'placeholder' });
      expect(screen.getByText('placeholder')).toBeInTheDocument();
    });
  });

  describe('when there is an item selected', () => {
    it('should NOT render the placeholder', () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({
        placeholder: 'placeholder',
        options,
        value: selectedOption,
      });
      expect(screen.queryByText('placeholder')).toBeNull();
    });

    it('should render the label of the selected item', () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, value: selectedOption });
      expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
    });

    it('should render a check icon in the list option', async () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, value: selectedOption });
      const trigger = screen.getByText(selectedOption.label);
      await userEvent.click(trigger);
      const listOption = screen.getByRole('option', {
        name: selectedOption.label,
      });
      expect(listOption).toContainHTML('svg');
    });
  });

  describe('when clicking on the trigger', () => {
    it('should display the list of options', async () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      renderSelect({ options, placeholder: 'placeholder' });
      await userEvent.click(screen.getByText('placeholder'));
      options.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('search', () => {
    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderSelect({});
        await userEvent.click(screen.getByRole('button', { name: 'Select' }));
        const search = screen.getByPlaceholderText('Search');
        await userEvent.type(search, defaultOptions[0].label);
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderSelect({
            emptyStateText: 'No results were found',
          });
          await userEvent.click(screen.getByRole('button', { name: 'Select' }));
          const search = screen.getByPlaceholderText('Search');
          await userEvent.type(search, 'Lorem');
          expect(screen.getByText('No results were found')).toBeInTheDocument();
        });
      });
    });
  });

  describe('when there is a hint', () => {
    it('should render the hint text', () => {
      const hint = 'This is an important message';
      renderSelect({ hint });
      expect(screen.getByText(hint)).toBeInTheDocument();
    });
  });

  describe('when there is a error', () => {
    it('should add an error border to the trigger', () => {
      renderSelect({
        hasError: true,
      });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger).toHaveStyle({
        border: `1px solid ${themes.light.borderColor.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderSelect({
        hasError: true,
        hint: 'Hint',
      });
      const hint = screen.getByText('Hint');
      expect(hint).toHaveStyle({
        color: themes.light.color.error,
      });
    });
  });

  describe('when is disabled', () => {
    it('should not be able to interact with the trigger', async () => {
      renderSelect({
        disabled: true,
      });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });
});
