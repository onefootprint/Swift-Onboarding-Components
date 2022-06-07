import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';
import themes from 'themes';

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
  { value: 'option 10', label: 'option 10' },
];

describe('<Select />', () => {
  const renderSelect = ({
    disabled,
    emptyStateTestID,
    emptyStateText,
    hasError,
    hintText,
    id = 'some id',
    label = 'label text',
    onSearchChangeText,
    onSelect = jest.fn(),
    options = defaultOptions,
    placeholder = 'Select...',
    renderOption,
    searchPlaceholder,
    selectedOption,
    testID = 'select-test-id',
  }: Partial<SelectProps>) =>
    customRender(
      <Select
        disabled={disabled}
        emptyStateTestID={emptyStateTestID}
        emptyStateText={emptyStateText}
        hasError={hasError}
        hintText={hintText}
        id={id}
        label={label}
        onSearchChangeText={onSearchChangeText}
        onSelect={onSelect}
        options={options}
        placeholder={placeholder}
        renderOption={renderOption}
        searchPlaceholder={searchPlaceholder}
        selectedOption={selectedOption}
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

  it('should render using a custom renderOption function', async () => {
    const [firstOption] = defaultOptions;
    const renderOption = (option: any) => <div>custom-{option.label}</div>;
    renderSelect({ label: 'label text', renderOption });
    const trigger = screen.getByText('label text');
    await userEvent.click(trigger);
    expect(screen.getByText(`custom-${firstOption.label}`)).toBeInTheDocument();
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
        selectedOption,
      });
      expect(screen.queryByText('placeholder')).toBeNull();
    });

    it('should render the label of the selected item', () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, selectedOption });
      expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
    });

    it('should render a check icon in the list option', async () => {
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      const [selectedOption] = options;
      renderSelect({ options, selectedOption });
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

  describe('when selecting an option', () => {
    it('should trigger onSelect with the selected option', async () => {
      const onSelectMockFn = jest.fn();
      const options = [
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
      ];
      renderSelect({
        options,
        onSelect: onSelectMockFn,
      });
      await userEvent.click(screen.getByText('Select...'));
      const [firstOption] = options;
      await userEvent.click(screen.getByText(firstOption.label));
      expect(onSelectMockFn).toHaveBeenCalledWith(firstOption);
    });
  });

  describe('search', () => {
    describe('when theres is more or equal than 10 options', () => {
      it('should display a search', async () => {
        renderSelect({ searchPlaceholder: 'Search now' });
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search now');
        expect(search).toBeInTheDocument();
      });
    });

    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderSelect({});
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search');
        await userEvent.type(search, 'option 5');
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      it('should trigger onSearchChangeText event', async () => {
        const onSearchChangeTextMockFn = jest.fn();
        renderSelect({ onSearchChangeText: onSearchChangeTextMockFn });
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search');
        const typedValue = 'L';
        await userEvent.type(search, typedValue);
        expect(onSearchChangeTextMockFn).toHaveBeenCalledWith(typedValue);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderSelect({
            emptyStateText: 'No results were found',
          });
          await userEvent.click(screen.getByText('Select...'));
          const search = screen.getByPlaceholderText('Search');
          await userEvent.type(search, 'Lorem');
          expect(screen.getByText('No results were found')).toBeInTheDocument();
        });

        describe('when there is a custom test id for the empty state', () => {
          it('should add a test id attribute', async () => {
            const emptyStateTestID = 'empty-state-test-id';
            renderSelect({
              emptyStateTestID,
            });
            await userEvent.click(screen.getByText('Select...'));
            const search = screen.getByPlaceholderText('Search');
            await userEvent.type(search, 'Lorem');
            expect(screen.getByTestId(emptyStateTestID)).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('when there is a hint', () => {
    it('should render the hint text', () => {
      const hintText = 'This is an important message';
      renderSelect({ hintText });
      expect(screen.getByText(hintText)).toBeInTheDocument();
    });
  });

  describe('when there is a error', () => {
    it('should add an error border to the trigger', () => {
      renderSelect({
        hasError: true,
      });
      const trigger = screen.getByText('Select...');
      expect(trigger).toHaveStyle({
        border: `1px solid ${themes.light.borderColor.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderSelect({
        hasError: true,
        hintText: 'Hint',
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
      const trigger = screen.getByText('Select...') as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });
});
