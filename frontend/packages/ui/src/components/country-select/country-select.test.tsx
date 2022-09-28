import { COUNTRIES as options } from '@onefootprint/global-constants';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import themes from '@onefootprint/themes';
import take from 'lodash/take';
import React from 'react';

import Select, { CountrySelectProps } from './country-select';

describe('<CountrySelect />', () => {
  const renderCountrySelect = ({
    disabled,
    emptyStateText,
    hasError,
    hint,
    id = 'some id',
    label = 'label text',
    onChange = jest.fn(),
    placeholder = 'Select',
    searchPlaceholder,
    value,
    testID = 'select-test-id',
  }: Partial<CountrySelectProps>) =>
    customRender(
      <Select
        disabled={disabled}
        emptyStateText={emptyStateText}
        hasError={hasError}
        hint={hint}
        id={id}
        label={label}
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
        value: selectedOption,
      });
      expect(screen.queryByText('placeholder')).toBeNull();
    });

    it('should render the label of the selected item', () => {
      const [selectedOption] = options;
      renderCountrySelect({ value: selectedOption });
      expect(screen.getByText(selectedOption.label)).toBeInTheDocument();
    });

    it('should render a check icon in the list option', async () => {
      const [selectedOption] = options;
      renderCountrySelect({ value: selectedOption });
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

  describe('search', () => {
    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderCountrySelect({});
        await userEvent.click(screen.getByRole('button', { name: 'Select' }));
        const search = screen.getByPlaceholderText('Search');
        await userEvent.type(search, 'Brazil');
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderCountrySelect({
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
      renderCountrySelect({ hint });
      expect(screen.getByText(hint)).toBeInTheDocument();
    });
  });

  describe('when there is a error', () => {
    it('should add an error border to the trigger', () => {
      renderCountrySelect({
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
      renderCountrySelect({
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
      renderCountrySelect({
        disabled: true,
      });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });
});
