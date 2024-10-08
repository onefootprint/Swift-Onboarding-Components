import '../../config/initializers/i18next-test';

import { COUNTRIES as options } from '@onefootprint/global-constants';
import { customRender, screen, selectEvents } from '@onefootprint/test-utils';
import take from 'lodash/take';

import type { CountrySelectProps } from './country-select';
import Select from './country-select';

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
    testID = 'select-test-id',
    value,
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
        testID={testID}
        value={value}
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

  it('should render the placeholder', () => {
    renderCountrySelect({ placeholder: 'placeholder' });
    expect(screen.getByText('placeholder')).toBeInTheDocument();
  });

  it('should render the hint text', () => {
    const hint = 'This is an important message';
    renderCountrySelect({ hint });
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  describe('when clicking on the trigger', () => {
    it('should display the list of options', async () => {
      renderCountrySelect({ options });
      const trigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.openMenu(trigger);
      const firstFive = take(options, 5);
      firstFive.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('when selecting an option', () => {
    it('should call the onChange callback', async () => {
      const onChange = jest.fn();
      renderCountrySelect({ onChange });
      const trigger = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(trigger, 'United States of America');
      expect(onChange).toHaveBeenCalledWith({
        driversLicense: true,
        idCard: true,
        label: 'United States of America',
        passport: true,
        value: 'US',
        value3: 'USA',
        visa: true,
        passportCard: true,
        workPermit: true,
        residenceDocument: true,
        voterIdentification: true,
      });
    });
  });

  describe('when there is an item selected', () => {
    it('should render the label of the selected item', () => {
      const [selectedOption] = options;
      renderCountrySelect({ value: selectedOption });
      expect(screen.getByText('United States of America')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    describe('when typing in the search', () => {
      it('should filter the results', async () => {
        renderCountrySelect({});
        const trigger = screen.getByRole('button', { name: 'Select' });
        await selectEvents.search(trigger, 'Italy');
        expect(screen.queryAllByRole('option').length).toEqual(1);
      });

      describe('when no results were found', () => {
        it('should display an empty state message', async () => {
          renderCountrySelect({
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
      renderCountrySelect({ hasError: true });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.getAttribute('data-has-error')).toEqual('true');
    });

    it('should add a error color to the hint', () => {
      renderCountrySelect({ hasError: true, hint: 'Hint' });
      const hint = screen.getByText('Hint');
      expect(hint.getAttribute('data-has-error')).toEqual('true');
    });
  });

  describe('when is disabled', () => {
    it('should not be able to interact with the trigger', async () => {
      renderCountrySelect({ disabled: true });
      const trigger = screen.getByRole('button', {
        name: 'Select',
      }) as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });
  });
});
