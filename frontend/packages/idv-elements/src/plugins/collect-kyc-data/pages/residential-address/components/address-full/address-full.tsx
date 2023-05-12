import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IdDI, isCountryCode } from '@onefootprint/types';
import {
  AddressInput,
  Button,
  CountrySelectOption,
  Grid,
  Select,
  SelectOption,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { KycData } from '../../../../utils/data-types';
import getAddressComponent from '../../utils/get-address-components/get-address-components';
import getInitialCountry from '../../utils/get-initial-country/get-initial-country';
import getInitialState from '../../utils/get-initial-state/get-initial-state';
import CountryField from '../country-field';
import ZipField from '../zip-field';

type FormData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string | SelectOption;
  country: CountrySelectOption;
  zip: string;
};

export type AddressFullProps = {
  isMutationLoading: boolean;
  onSubmit: (residentialAddress: KycData) => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const AddressFull = ({
  isMutationLoading,
  ctaLabel,
  onSubmit,
  hideHeader,
}: AddressFullProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const { t } = useTranslation('pages.residential-address.full');
  const { t: cta } = useTranslation('pages.cta');

  const countryVal = data[IdDI.country]?.value;
  const defaultCountry =
    countryVal && isCountryCode(countryVal) ? countryVal : undefined;
  const defaultValues = {
    country: getInitialCountry(defaultCountry),
    state: getInitialState(data[IdDI.state]?.value),
    city: data[IdDI.city]?.value,
    zip: data[IdDI.zip]?.value,
    addressLine1: data[IdDI.addressLine1]?.value,
    addressLine2: data[IdDI.addressLine2]?.value,
  };

  const methods = useForm<FormData>({
    defaultValues,
  });
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
  } = methods;
  const country = watch('country');

  const onSubmitFormData = (formData: FormData) => {
    onSubmit({
      [IdDI.addressLine1]: { value: formData.addressLine1 },
      [IdDI.addressLine2]: { value: formData.addressLine2 },
      [IdDI.city]: { value: formData.city },
      [IdDI.zip]: { value: formData.zip },
      [IdDI.country]: { value: formData.country.value },
      [IdDI.state]:
        typeof formData.state === 'object'
          ? { value: formData.state.value }
          : { value: formData.state },
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
    <>
      {!hideHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmitFormData)}>
          {!hideHeader && (
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          )}
          <CountryField onChange={handleCountryChange} data-private />
          <AddressInput
            data-private
            country={country.value}
            hasError={!!errors.addressLine1}
            hint={errors.addressLine1 && t('form.address-line-1.error')}
            label={t('form.address-line-1.label')}
            onSelect={handleAddressSelect}
            placeholder={t('form.address-line-1.placeholder')}
            {...register('addressLine1', {
              required: true,
              pattern: /^(?!p\.?o\.?\s?box).*$/i,
            })}
          />
          <TextInput
            data-private
            autoComplete="address-line2"
            label={t('form.address-line-2.label')}
            placeholder={t('form.address-line-2.placeholder')}
            {...register('addressLine2')}
          />
          <Grid.Row>
            <Grid.Column col={6}>
              <TextInput
                data-private
                autoComplete="address-level2"
                hasError={!!errors.city}
                hint={errors.city && t('form.city.error')}
                label={t('form.city.label')}
                placeholder={t('form.city.placeholder')}
                {...register('city', { required: true })}
              />
            </Grid.Column>
            <Grid.Column col={6}>
              <ZipField countryCode={country.value} />
            </Grid.Column>
          </Grid.Row>
          {country.value === 'US' ? (
            <Controller
              control={control}
              name="state"
              rules={{ required: true }}
              render={({ field, fieldState: { error } }) => {
                const value =
                  typeof field.value === 'object' ? field.value : undefined;
                return (
                  <Select
                    isPrivate
                    label={t('form.state.label')}
                    onBlur={field.onBlur}
                    options={STATES}
                    onChange={nextOption => {
                      field.onChange(nextOption);
                    }}
                    hint={error && t('form.state.error')}
                    hasError={!!error}
                    placeholder={t('form.state.placeholder')}
                    value={value}
                  />
                );
              }}
            />
          ) : (
            <TextInput
              data-private
              autoComplete="address-level1"
              hasError={!!errors.state}
              hint={errors.state && t('form.state.error')}
              label={t('form.state.label')}
              placeholder={t('form.state.placeholder')}
              {...register('state')}
            />
          )}
          <Button type="submit" fullWidth loading={isMutationLoading}>
            {ctaLabel ?? cta('continue')}
          </Button>
        </Form>
      </FormProvider>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default AddressFull;
