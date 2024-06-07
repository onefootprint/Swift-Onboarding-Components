import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { MultiSelectProps } from './multi-select';
import MultiSelect from './multi-select';

const defaultOptions = [
  { value: 'full_name', label: 'Full name' },
  { value: 'email', label: 'Email' },
  { value: 'phone_number', label: 'Phone number' },
];

type Option = {
  label: string;
  value: string;
};

type Group = {
  options: readonly Option[];
  label?: string;
};

describe('<MultiSelect />', () => {
  const renderMultiSelect = ({
    defaultValue,
    disabled,
    emptyStateText,
    id,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    onInputChange,
    options = defaultOptions,
    placeholder,
    value,
  }: Partial<MultiSelectProps<Option, Group>>) =>
    customRender(
      <MultiSelect
        defaultValue={defaultValue}
        disabled={disabled}
        emptyStateText={emptyStateText}
        id={id}
        label={label}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onInputChange={onInputChange}
        options={options}
        placeholder={placeholder}
        value={value}
      />,
    );

  it('should render the label', () => {
    renderMultiSelect({ label: 'Permissible attributes' });
    expect(screen.getByLabelText('Permissible attributes')).toBeInTheDocument();
  });

  it('should render the placeholder', () => {
    renderMultiSelect({ placeholder: 'Search...' });
    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  describe('when clicking on the select', () => {
    it('should display the list of options', async () => {
      const options = defaultOptions;
      renderMultiSelect({ options, placeholder: 'Search...' });
      const trigger = screen.getByText('Search...');
      await userEvent.click(trigger);
      options.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument();
      });
    });
  });

  describe('when selecting an option', () => {
    it('should call the onChange callback', async () => {
      const onChange = jest.fn();
      const options = defaultOptions;
      renderMultiSelect({ options, placeholder: 'Search...', onChange });
      const trigger = screen.getByText('Search...');
      await userEvent.click(trigger);
      const firstOption = screen.getByText(options[0].label);
      await userEvent.click(firstOption);
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([{ label: 'Full name', value: 'full_name' }], {
          action: 'select-option',
          name: undefined,
          option: { label: 'Full name', value: 'full_name' },
        });
      });
    });
  });
});
