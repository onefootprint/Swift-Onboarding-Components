import '../../config/initializers/i18next-test';

import {
  createGoogleMapsSpy,
  customRender,
  getPlacePredictions,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';

import type { AddressInputProps } from './address-input';
import AddressInput from './address-input';

describe('AddressInput', () => {
  beforeEach(() => {
    createGoogleMapsSpy();
    getPlacePredictions.mockClear();
  });

  const renderAddressInput = ({
    country = 'US',
    label = 'Address',
    onBlur,
    onChange,
    onChangeText,
    onKeyDown,
    onSelect,
    placeholder = 'Type your address',
    ...rest
  }: Partial<AddressInputProps>) => {
    customRender(
      <AddressInput
        country={country}
        label={label}
        onBlur={onBlur}
        onChange={onChange}
        onChangeText={onChangeText}
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        placeholder={placeholder}
        {...rest}
      />,
    );
  };

  it('should render the input', () => {
    renderAddressInput({ label: 'Address', placeholder: 'Type your address' });

    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your address')).toBeInTheDocument();
  });

  it('should allow to pass arbitrary props to the input', () => {
    renderAddressInput({ testID: 'address-input' });

    expect(screen.getByTestId('address-input')).toBeInTheDocument();
  });

  it('should call the onChangeText prop when the input value changes', async () => {
    const onChangeText = jest.fn();
    renderAddressInput({
      testID: 'address-input',
      onChangeText,
    });
    const input = screen.getByLabelText('Address');

    await userEvent.type(input, '14 Linda Street');
    expect(onChangeText).toHaveBeenCalledWith('14 Linda Street');
  });

  it('should render the address suggestions dropdown when the input has a value', async () => {
    renderAddressInput({
      label: 'Address',
    });

    const input = screen.getByLabelText('Address');
    await userEvent.type(input, '14 Linda Street');

    await waitFor(() => {
      expect(screen.getByText('14 Linda Street')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Westborough, MA, USA')).toBeInTheDocument();
    });
  });

  it('should call the onSelect prop when an address suggestion is selected', async () => {
    const onSelect = jest.fn();
    renderAddressInput({
      label: 'Address',
      onSelect,
    });

    const input = screen.getByLabelText('Address');
    await userEvent.type(input, '14 Linda Street');
    await waitFor(() => {
      expect(screen.getByText('14 Linda Street')).toBeInTheDocument();
    });
    const suggestion = screen.getByText('14 Linda Street');
    await userEvent.click(suggestion);

    expect(onSelect).toHaveBeenCalledWith({
      description: '14 Linda Street, Westborough, MA, USA',
      matched_substrings: [
        {
          length: 15,
          offset: 0,
        },
      ],
      place_id:
        'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
      reference:
        'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
      structured_formatting: {
        main_text: '14 Linda Street',
        main_text_matched_substrings: [
          {
            length: 15,
            offset: 0,
          },
        ],
        secondary_text: 'Westborough, MA, USA',
      },
      terms: [
        {
          offset: 0,
          value: '14 Linda Street',
        },
        {
          offset: 17,
          value: 'Westborough',
        },
        {
          offset: 30,
          value: 'MA',
        },
        {
          offset: 34,
          value: 'USA',
        },
      ],
      types: ['street_address', 'geocode'],
    });
  });
});
