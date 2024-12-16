import { patchHostedUserVaultMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import Header from '../../components/header';
import Layout from '../../components/layout';
import Button from '../../components/ui/button';
import FormError from '../../components/ui/form-error';
import FormInput from '../../components/ui/form-input';
import FormLabel from '../../components/ui/form-label';
import FormSelect from '../../components/ui/form-select';
import type { FormData } from '../../types/form-data';
import transformDataBeforeVault from '../../utils/transform-data-before-vault';
import countryStates from './address-data-step.constants';

type AddressDataStepProps = {
  defaultValues: FormData;
  onSubmit: (data: FormData) => void;
};

const AddressDataStep = ({ defaultValues, onSubmit }: AddressDataStepProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      country: defaultValues.country || 'US',
      addressLine1: defaultValues.addressLine1 || '',
      addressLine2: defaultValues.addressLine2 || '',
      city: defaultValues.city || '',
      state: defaultValues.state || 'NY',
      zipcode: defaultValues.zipcode || '',
    },
  });
  const mutation = useMutation(patchHostedUserVaultMutation({}));
  const country = useWatch({
    control,
    name: 'country',
  });
  const states = countryStates[country as keyof typeof countryStates] || [];

  const onFormSubmit = async (formData: FormData) => {
    const transformedData = transformDataBeforeVault(formData);
    mutation.mutateAsync(
      {
        body: {
          'id.country': transformedData.country,
          'id.address_line1': transformedData.addressLine1,
          'id.address_line2': transformedData.addressLine2,
          'id.city': transformedData.city,
          'id.state': transformedData.state,
          'id.zip': transformedData.zipcode,
        },
      },
      {
        onSuccess: () => {
          onSubmit(formData);
        },
      },
    );
  };

  return (
    <Layout>
      <Header
        title="What's their residential address?"
        subtitle="We need to collect this information to verify their identity."
      />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="country">Country *</FormLabel>
          <FormSelect id="country" {...register('country', { required: 'Country is required' })}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </FormSelect>
          <FormError>{errors.country?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="addressLine1">Address Line 1 *</FormLabel>
          <FormInput
            id="addressLine1"
            placeholder="123 Main St"
            {...register('addressLine1', { required: 'Address Line 1 is required' })}
          />
          <FormError>{errors.addressLine1?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="addressLine2">Address Line 2</FormLabel>
          <FormInput id="addressLine2" placeholder="Apt 4B" {...register('addressLine2')} />
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="city">City *</FormLabel>
          <FormInput id="city" placeholder="New York" {...register('city', { required: 'City is required' })} />
          <FormError>{errors.city?.message}</FormError>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <FormLabel htmlFor="state">State *</FormLabel>
            <FormSelect id="state" {...register('state', { required: 'State is required' })}>
              <option value="">Select...</option>
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </FormSelect>
            <FormError>{errors.state?.message}</FormError>
          </div>
          <div className="flex-1">
            <FormLabel htmlFor="zipcode">Zipcode *</FormLabel>
            <FormInput id="zipcode" placeholder="10001" {...register('zipcode', { required: 'Zipcode is required' })} />
            <FormError>{errors.zipcode?.message}</FormError>
          </div>
        </div>
        <FormError>{mutation.error?.message}</FormError>
        <div className="mt-3 mb-4">
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default AddressDataStep;
