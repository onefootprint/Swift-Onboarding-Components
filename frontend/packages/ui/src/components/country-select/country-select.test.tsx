import take from 'lodash/take';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';
import themes from 'themes';

import Select, { CountrySelectProps, options } from './country-select';

describe('<CountrySelect />', () => {
  const renderCountrySelect = ({
    disabled,
    emptyStateTestID,
    emptyStateText,
    hasError,
    hintText,
    id = 'some id',
    label = 'label text',
    onSearchChangeText,
    onChange = jest.fn(),
    placeholder = 'Select...',
    searchPlaceholder,
    value,
    testID = 'select-test-id',
  }: Partial<CountrySelectProps>) =>
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
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        value={value}
        testID={testID}
      />,
    );

  it('should add a test id attribute', () => {
    renderCountrySelect({ testID: 'select-test-id' });
    expect(screen.getByTestId('select-test-id')).toBeInTheDocument();
  });

  it('should render the label', () => {
    renderCountrySelect({ label: 'some label text' });
    expect(screen.getByText('some label text')).toBeInTheDocument();
  });

  describe('when there is NO item selected', () => {
    it('should render the placeholder', () => {
      renderCountrySelect({ placeholder: 'placeholder' });
      expect(screen.getByText('placeholder')).toBeInTheDocument();
    });
  });

  describe('when there is an item selected', () => {
    it('should NOT render the placeholder', () => {
      const [selectedOption] = options;
      renderCountrySelect({
        placeholder: 'placeholder',
        value: selectedOption.value,
      });
      expect(screen.queryByText('placeholder')).toBeNull();
    });

    it('should render the label of the selected item', () => {
      const [selectedOption] = options;
      renderCountrySelect({ value: selectedOption.value });
      expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
    });

    it('should render a check icon in the list option', async () => {
      const [selectedOption] = options;
      renderCountrySelect({ value: selectedOption.value });
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
      renderCountrySelect({ placeholder: 'placeholder' });
      await userEvent.click(screen.getByText('placeholder'));
      const firstFive = take(options, 5);

      firstFive.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('when selecting an option', () => {
    it('should trigger onChange with the selected option', async () => {
      const onChangeMockFn = jest.fn();
      renderCountrySelect({
        onChange: onChangeMockFn,
      });
      await userEvent.click(screen.getByText('Select...'));
      const [firstOption] = options;
      await userEvent.click(screen.getByText(firstOption.label));
      expect(onChangeMockFn).toHaveBeenCalledWith(firstOption);
    });
  });

  describe('search', () => {
    describe('when theres is more or equal than 10 options', () => {
      it('should display a search', async () => {
        renderCountrySelect({ searchPlaceholder: 'Search now' });
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search now');
        expect(search).toBeInTheDocument();
      });
    });

    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderCountrySelect({});
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search');
        await userEvent.type(search, 'Brazil');
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      it('should trigger onSearchChangeText event', async () => {
        const onSearchChangeTextMockFn = jest.fn();
        renderCountrySelect({ onSearchChangeText: onSearchChangeTextMockFn });
        await userEvent.click(screen.getByText('Select...'));
        const search = screen.getByPlaceholderText('Search');
        const typedValue = 'L';
        await userEvent.type(search, typedValue);
        expect(onSearchChangeTextMockFn).toHaveBeenCalledWith(typedValue);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderCountrySelect({
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
            renderCountrySelect({
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
      renderCountrySelect({ hintText });
      expect(screen.getByText(hintText)).toBeInTheDocument();
    });
  });

  describe('when there is a error', () => {
    it('should add an error border to the trigger', () => {
      renderCountrySelect({
        hasError: true,
      });
      const trigger = screen.getByText('Select...');
      expect(trigger).toHaveStyle({
        border: `1px solid ${themes.light.borderColor.error}`,
      });
    });

    it('should add an error border to the hint', () => {
      renderCountrySelect({
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
      renderCountrySelect({
        disabled: true,
      });
      const trigger = screen.getByText('Select...') as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });
});
