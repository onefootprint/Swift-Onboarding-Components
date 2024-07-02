import { STATES } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { BusinessDI } from '@onefootprint/types';
import type { CountrySelectOption, SelectOption } from '@onefootprint/ui';
import { AddressInput, Grid, Stack, TextInput } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import type { BusinessAddressData } from '../../../../utils/state-machine/types';
import getAddressComponent from '../../utils/get-address-components';
import getInitialCountry from '../../utils/get-initial-country';
import getInitialState from '../../utils/get-initial-state';
import CityField from '../city-field';
import CountryField from '../country-field';
import StateField from '../state-field';
import ZipField from '../zip-field';

type FormData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string | SelectOption;
  country: CountrySelectOption;
  zip: string;
};

type DefaultValues = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: CountryCode;
  zip: string;
};

export type BusinessAddressFormProps = {
  defaultValues?: Partial<DefaultValues>;
  isLoading: boolean;
  onSubmit: (businessAddress: BusinessAddressData) => void;
  onCancel?: () => void;
  ctaLabel?: string;
};

const BusinessAddressForm = ({ defaultValues, isLoading, ctaLabel, onSubmit, onCancel }: BusinessAddressFormProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.business-address.form',
  });

  const methods = useForm<FormData>({
    defaultValues: {
      country: getInitialCountry(defaultValues?.country),
      state: getInitialState(defaultValues?.state),
      city: defaultValues?.city,
      zip: defaultValues?.zip,
      addressLine1: defaultValues?.addressLine1,
      addressLine2: defaultValues?.addressLine2,
    },
  });

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setFocus,
    setValue,
  } = methods;
  const country = watch('country');

  const onSubmitFormData = (formData: FormData) => {
    const stateData = formData.state;
    const stateStr = typeof stateData === 'object' ? stateData.value : stateData;

    onSubmit({
      [BusinessDI.addressLine1]: formData.addressLine1,
      [BusinessDI.addressLine2]: formData.addressLine2,
      [BusinessDI.city]: formData.city,
      [BusinessDI.zip]: formData.zip,
      [BusinessDI.country]: formData.country.value,
      [BusinessDI.state]: stateStr,
    });
  };

  const resetFieldsExcludingCountry = () => {
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
  };

  const handleCountryChange = () => {
    setFocus('addressLine1');
    resetFieldsExcludingCountry();
  };

  const handleAddressSelect = async (prediction?: google.maps.places.AutocompletePrediction | null) => {
    if (!prediction) {
      return;
    }

    resetFieldsExcludingCountry();

    const formattedStreetAddress = prediction?.structured_formatting.main_text;
    if (formattedStreetAddress) {
      setValue('addressLine1', formattedStreetAddress);
    }

    const result = await getAddressComponent(prediction);
    if (result) {
      if (result.city) {
        setValue('city', result.city);
      }
      if (result.state) {
        if (country.value === 'US') {
          const possibleState = STATES.find(stateOption => stateOption.label === result.state);
          if (possibleState) {
            setValue('state', possibleState);
          }
        } else {
          setValue('state', result.state);
        }
      }
      if (result.zip) {
        setValue('zip', result.zip);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Grid.Container tag="form" gap={7} width="100%" onSubmit={handleSubmit(onSubmitFormData)}>
        <Stack gap={5} direction="column">
          <CountryField onChange={handleCountryChange} data-dd-privacy="mask" />
          <AddressInput
            autoFocus
            data-dd-privacy="mask"
            country={country.value}
            hasError={!!errors.addressLine1}
            hint={errors.addressLine1 && t('address-line-1.error')}
            label={t('address-line-1.label')}
            onSelect={handleAddressSelect}
            placeholder={t('address-line-1.placeholder')}
            {...register('addressLine1', { required: true })}
          />
          <TextInput
            data-dd-privacy="mask"
            autoComplete="address-line2"
            label={t('address-line-2.label')}
            placeholder={t('address-line-2.placeholder')}
            {...register('addressLine2')}
          />
          <Grid.Container gap={5} columns={['1fr', '1fr']}>
            <CityField />
            <ZipField countryCode={country.value} />
          </Grid.Container>
          <StateField countryCode={country.value} />
        </Stack>
        <EditableFormButtonContainer
          onCancel={onCancel}
          isLoading={isLoading}
          ctaLabel={ctaLabel}
          submitButtonTestID="kyb-biss-address"
        />
      </Grid.Container>
    </FormProvider>
  );
};

export default BusinessAddressForm;
