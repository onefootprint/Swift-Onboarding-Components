import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { BusinessDI, CountryCode } from '@onefootprint/types';
import {
  AddressInput,
  CountrySelectOption,
  Grid,
  SelectOption,
  TextInput,
} from '@onefootprint/ui';
import Button from '@onefootprint/ui/src/components/button/button';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { BusinessAddressData } from '../../../../utils/state-machine/types';
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
  ctaLabel?: string;
};

const BusinessAddressForm = ({
  defaultValues,
  isLoading,
  ctaLabel,
  onSubmit,
}: BusinessAddressFormProps) => {
  const { allT, t } = useTranslation('pages.business-address.form');

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
    setFocus,
    setValue,
  } = methods;
  const country = watch('country');

  const onSubmitFormData = (formData: FormData) => {
    const stateData = formData.state;
    const stateStr =
      typeof stateData === 'object' ? stateData.value : stateData;

    onSubmit({
      [BusinessDI.addressLine1]: formData.addressLine1,
      [BusinessDI.addressLine2]: formData.addressLine2,
      [BusinessDI.city]: formData.city,
      [BusinessDI.zip]: formData.zip,
      [BusinessDI.country]: formData.country.value,
      [BusinessDI.state]: stateStr,
    });
  };

  const handleCountryChange = () => {
    setFocus('addressLine1');
    setValue('addressLine1', '');
    setValue('addressLine2', '');
    setValue('city', '');
    setValue('state', '');
    setValue('zip', '');
  };

  const handleAddressSelect = async (
    prediction?: google.maps.places.AutocompletePrediction | null,
  ) => {
    if (prediction) {
      const formattedStreetAddress =
        prediction?.structured_formatting.main_text;
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
            const possibleState = STATES.find(
              stateOption => stateOption.label === result.state,
            );
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
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
        <CountryField onChange={handleCountryChange} data-private />
        <AddressInput
          data-private
          country={country.value}
          hasError={!!errors.addressLine1}
          hint={errors.addressLine1 && t('address-line-1.error')}
          label={t('address-line-1.label')}
          onSelect={handleAddressSelect}
          placeholder={t('address-line-1.placeholder')}
          {...register('addressLine1', { required: true })}
        />
        <TextInput
          data-private
          autoComplete="address-line2"
          label={t('address-line-2.label')}
          placeholder={t('address-line-2.placeholder')}
          {...register('addressLine2')}
        />
        <Grid.Row>
          <Grid.Column col={6}>
            <CityField />
          </Grid.Column>
          <Grid.Column col={6}>
            <ZipField countryCode={country.value} />
          </Grid.Column>
        </Grid.Row>
        <StateField countryCode={country.value} />
        <Button type="submit" fullWidth loading={isLoading}>
          {ctaLabel ?? allT('pages.cta-continue')}
        </Button>
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BusinessAddressForm;
