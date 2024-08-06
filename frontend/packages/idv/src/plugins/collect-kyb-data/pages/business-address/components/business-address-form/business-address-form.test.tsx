import '../../../../../../config/initializers/i18next-test';

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

import type { BusinessAddressFormProps } from './business-address-form';
import BusinessAddressForm from './business-address-form';

describe('<BusinessAddressForm />', () => {
  const renderBusinessAddressForm = ({
    defaultValues,
    isLoading = false,
    ctaLabel,
    onSubmit = () => undefined,
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

  it('should render a custom cta label', () => {
    renderBusinessAddressForm({ ctaLabel: 'Save' });
    const continueButton = screen.getByRole('button', { name: 'Save' });
    expect(continueButton).toBeInTheDocument();
  });

  describe('when defaultValues is set', () => {
    it('should prefill the fields', async () => {
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

  // TODO: https://linear.app/footprint/issue/FP-4291/cant-test-selectevents-getting-an-act-error
  it.skip('onsubmit gets called when submitting business address', async () => {
    const onSubmit = jest.fn();
    renderBusinessAddressForm({ onSubmit });

    const addressLine1 = screen.getByLabelText('Address line 1');
    await userEvent.type(addressLine1, '123 Main St.');

    const addressLine2 = screen.getByLabelText('Address line 2 (optional)');
    await userEvent.type(addressLine2, 'APT 123.');

    const city = screen.getByLabelText('City');
    await userEvent.type(city, 'Brooklyn');

    const zipCode = screen.getByLabelText('Zip code');
    await userEvent.type(zipCode, '10001');

    const stateTrigger = screen.getByRole('button', { name: 'Select' });
    act(() => {
      selectEvents.select(stateTrigger, 'Alabama');
    });

    await waitFor(() => {
      expect(screen.getByText('Alabama')).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    await userEvent.click(continueButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
