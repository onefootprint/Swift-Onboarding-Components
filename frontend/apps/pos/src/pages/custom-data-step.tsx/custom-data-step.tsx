import { patchHostedUserVaultMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Header from '../../components/header';
import Layout from '../../components/layout';
import Button from '../../components/ui/button';
import FormError from '../../components/ui/form-error';
import FormInput from '../../components/ui/form-input';
import FormLabel from '../../components/ui/form-label';
import FormSelect from '../../components/ui/form-select';
import type { FormData } from '../../types/form-data';
import transformDataBeforeVault from '../../utils/transform-data-before-vault';
import { awd, carClasses, distributedChannels, prestigeCategory, rentalZones } from './custom-data-step.constants';

type CustomDataStepProps = {
  defaultValues: FormData;
  onSubmit: (data: FormData) => void;
  onGoBack: () => void;
};

const CustomDataStep = ({ defaultValues, onSubmit }: CustomDataStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      category: defaultValues.category || '',
      awd: defaultValues.awd || '',
      reservedCarClass: defaultValues.reservedCarClass || '',
      elor: defaultValues.elor || 0,
      rentalZone: defaultValues.rentalZone || '',
      under24hRental: defaultValues.under24hRental || false,
      businessLeisure: defaultValues.businessLeisure || false,
      localMarketIndicator: defaultValues.localMarketIndicator || false,
      distributionChannel: defaultValues.distributionChannel || '',
    },
  });
  const mutation = useMutation(patchHostedUserVaultMutation({}));

  const onFormSubmit = async (formData: FormData) => {
    const data = transformDataBeforeVault(formData);
    mutation.mutateAsync(
      {
        body: {
          'custom.category': data.category,
          'custom.awd': data.awd,
          'custom.reserved_car_class': data.reservedCarClass,
          'custom.elor': data.elor,
          'custom.rental_state': data.rentalZone,
          'custom.under_24h_rental': data.under24hRental,
          'custom.business_leisure': data.businessLeisure,
          'custom.local_market_indicator': data.localMarketIndicator,
          'custom.distribution_channel': data.distributionChannel,
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
      <Header title="Rental-related information" subtitle="Please provide additional information." />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="category">Prestige category *</FormLabel>
          <FormSelect {...register('category', { required: 'Category is required' })} id="category">
            <option value="">Select...</option>
            {prestigeCategory.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </FormSelect>
          <FormError>{errors.category?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="awd">AWD *</FormLabel>
          <FormSelect {...register('awd', { required: 'AWD is required' })} id="awd">
            <option value="">Select...</option>
            {awd.map(awd => (
              <option key={awd.value} value={awd.value}>
                {awd.label}
              </option>
            ))}
          </FormSelect>
          <FormError>{errors.awd?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="reservedCarClass">Reserved Car Class *</FormLabel>
          <FormSelect
            {...register('reservedCarClass', { required: 'Reserved Car Class is required' })}
            id="reservedCarClass"
          >
            <option value="">Select...</option>
            {carClasses.map(carClass => (
              <option key={carClass.value} value={carClass.value}>
                {carClass.label}
              </option>
            ))}
          </FormSelect>
          <FormError>{errors.reservedCarClass?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="elor">Estimated Length of Rental (ELOR) *</FormLabel>
          <FormInput
            {...register('elor', {
              required: 'Estimated Length of Rental is required',
              valueAsNumber: true,
              validate: value => value > 0 || 'ELOR must be a positive number',
            })}
            id="elor"
            type="number"
            placeholder="Type the estimated number of days"
          />
          <FormError>{errors.elor?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="rentalZone">Rental Zone *</FormLabel>
          <FormSelect {...register('rentalZone', { required: 'Rental Zone is required' })} id="rentalZone">
            <option value="">Select...</option>
            {rentalZones.map(rentalZone => (
              <option key={rentalZone.value} value={rentalZone.value}>
                {rentalZone.label}
              </option>
            ))}
          </FormSelect>
          <FormError>{errors.rentalZone?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="under24hRental">Under 24h rental *</FormLabel>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                {...register('under24hRental', { required: 'Under 24h rental is required' })}
                value="Y"
                className="radio-input"
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                {...register('under24hRental', { required: 'Under 24h rental is required' })}
                value="N"
                className="radio-input"
              />
              No
            </label>
          </div>
          <FormError>{errors.under24hRental?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="businessLeisure">Business Leisure Indicator *</FormLabel>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                {...register('businessLeisure', { required: 'Business Leisure Indicator is required' })}
                value="L"
                className="radio-input"
              />
              Leisure
            </label>
            <label className="radio-label">
              <input
                type="radio"
                {...register('businessLeisure', { required: 'Business Leisure Indicator is required' })}
                value="B"
                className="radio-input"
              />
              Business
            </label>
          </div>
          <FormError>{errors.businessLeisure?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="localMarketIndicator">Local Market Indicator *</FormLabel>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                {...register('localMarketIndicator', { required: 'Local Market Indicator is required' })}
                value="Y"
                className="radio-input"
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                {...register('localMarketIndicator', { required: 'Local Market Indicator is required' })}
                value="N"
                className="radio-input"
              />
              No
            </label>
          </div>
          <FormError>{errors.localMarketIndicator?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="distributionChannel">Distribution Channel *</FormLabel>
          <FormSelect
            {...register('distributionChannel', { required: 'Distribution Channel is required' })}
            id="distributionChannel"
          >
            <option value="">Select...</option>
            {distributedChannels.map(distributedChannel => (
              <option key={distributedChannel.value} value={distributedChannel.value}>
                {distributedChannel.label}
              </option>
            ))}
          </FormSelect>
          <FormError>{errors.distributionChannel?.message}</FormError>
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

export default CustomDataStep;
