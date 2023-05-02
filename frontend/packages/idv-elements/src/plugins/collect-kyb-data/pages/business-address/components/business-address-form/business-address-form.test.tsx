import {
  act,
  createGoogleMapsSpy,
  customRender,
  getPlacePredictions,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { BusinessDI } from '@onefootprint/types';
import React from 'react';

import BusinessAddressForm, {
  BusinessAddressFormProps,
} from './business-address-form';

describe('<BusinessAddressForm />', () => {
  const renderBusinessAddressForm = ({
    defaultValues,
    isLoading = false,
    ctaLabel,
    onSubmit = () => {},
  }: Partial<BusinessAddressFormProps>) =>
    customRender(
      <BusinessAddressForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        ctaLabel={ctaLabel}
        onSubmit={onSubmit}
      />,
    );

  beforeEach(() => {
    createGoogleMapsSpy();
    getPlacePredictions.mockClear();
  });

  it.skip('onsubmit gets called when submitting business address', async () => {
    const onSubmit = jest.fn();
    renderBusinessAddressForm({ onSubmit });

    const addressLine1 = screen.getByLabelText('Address line 1');
    expect(
      screen.getByPlaceholderText('Street and house number'),
    ).toBeInTheDocument();
    expect(addressLine1).toBeInTheDocument();
    await userEvent.type(addressLine1, '123 Main St.');

    const addressLine2 = screen.getByLabelText('Address line 2 (optional)');
    expect(
      screen.getByPlaceholderText('Apartment, suite, etc.'),
    ).toBeInTheDocument();
    expect(addressLine2).toBeInTheDocument();
    await userEvent.type(addressLine2, 'APT 123.');

    const city = screen.getByLabelText('City');
    expect(screen.getByPlaceholderText('New York')).toBeInTheDocument();
    expect(city).toBeInTheDocument();
    await userEvent.type(city, 'Brooklyn');

    const state = screen.getByText('State');
    expect(state).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Select' });
    expect(trigger).toBeInTheDocument();

    act(() => {
      selectEvents.openMenu(trigger);
    });
    await waitFor(() => {
      expect(screen.getByText('Alabama')).toBeInTheDocument();
    });

    act(() => {
      selectEvents.select(trigger, 'Alabama');
    });
    await waitFor(() => {
      expect(screen.getByText('Alabama')).toBeInTheDocument();
    });

    const zipCode = screen.getByLabelText('Zip code');
    expect(screen.getByPlaceholderText('11206')).toBeInTheDocument();
    expect(zipCode).toBeInTheDocument();
    await userEvent.type(zipCode, '10001');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({
        [BusinessDI.addressLine1]: '123 Main St.',
        [BusinessDI.addressLine2]: 'APT 123.',
        [BusinessDI.city]: 'Brooklyn',
        [BusinessDI.state]: 'AL',
        [BusinessDI.zip]: '10001',
        [BusinessDI.country]: 'US',
      });
    });
  });

  it('renders custom cta label', () => {
    renderBusinessAddressForm({ ctaLabel: 'Save' });
    const continueButton = screen.getByRole('button', { name: 'Save' });
    expect(continueButton).toBeInTheDocument();
  });

  it('renders default values', () => {
    renderBusinessAddressForm({
      defaultValues: {
        addressLine1: '123 Main St.',
        addressLine2: 'APT 123.',
        city: 'Brooklyn',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    });
    expect(screen.getByDisplayValue('123 Main St.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('APT 123.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Brooklyn')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
  });
});
