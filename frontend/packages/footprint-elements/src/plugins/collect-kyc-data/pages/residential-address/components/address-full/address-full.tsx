import { STATES } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
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

import HeaderTitle from '../../../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { ResidentialAddressFull } from '../../../../utils/data-types';
import getAddressComponent from '../../utils/get-address-components/get-address-components';
import getInitialCountry from '../../utils/get-initial-country/get-initial-country';
import getInitialState from '../../utils/get-initial-state/get-initial-state';
import CountryField from '../country-field';
import ZipField from '../zip-field';

type FormData = {
  [UserDataAttribute.addressLine1]: string;
  [UserDataAttribute.addressLine2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string | SelectOption;
  [UserDataAttribute.country]: CountrySelectOption;
  [UserDataAttribute.zip]: string;
};

export type AddressFullProps = {
  isMutationLoading: boolean;
  onSubmit: (residentialAddress: ResidentialAddressFull) => void;
  ctaLabel?: string;
  hideTitle?: boolean;
  hideNavHeader?: boolean;
};

const AddressFull = ({
  isMutationLoading,
  ctaLabel,
  onSubmit,
  hideTitle,
  hideNavHeader,
}: AddressFullProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const { t } = useTranslation('pages.residential-address.full');
  const { t: cta } = useTranslation('pages.cta');
  const methods = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: getInitialCountry(
        data[UserDataAttribute.country],
      ),
      [UserDataAttribute.state]: getInitialState(data[UserDataAttribute.state]),
      [UserDataAttribute.city]: data[UserDataAttribute.city],
      [UserDataAttribute.zip]: data[UserDataAttribute.zip],
      [UserDataAttribute.addressLine1]: data[UserDataAttribute.addressLine1],
      [UserDataAttribute.addressLine2]: data[UserDataAttribute.addressLine2],
    },
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
  const country = watch(UserDataAttribute.country);

  const onSubmitFormData = (formData: FormData) => {
    onSubmit({
      address_line1: formData.address_line1,
      address_line2: formData.address_line2,
      city: formData.city,
      zip: formData.zip,
      country: formData.country.value,
      state:
        typeof formData.state === 'object'
          ? formData.state.value
          : formData.state,
    });
  };

  const handleCountryChange = () => {
    setFocus(UserDataAttribute.addressLine1);
    setValue(UserDataAttribute.addressLine1, '');
    setValue(UserDataAttribute.addressLine2, '');
    setValue(UserDataAttribute.city, '');
    setValue(UserDataAttribute.state, '');
    setValue(UserDataAttribute.zip, '');
  };

  const handleAddressSelect = async (
    prediction?: google.maps.places.AutocompletePrediction | null,
  ) => {
    if (prediction) {
      const formattedStreetAddress =
        prediction?.structured_formatting.main_text;
      if (formattedStreetAddress) {
        setValue(UserDataAttribute.addressLine1, formattedStreetAddress);
      }

      const result = await getAddressComponent(prediction);
      if (result) {
        if (result.city) {
          setValue(UserDataAttribute.city, result.city);
        }
        if (result.state) {
          if (country.value === 'US') {
            const possibleState = STATES.find(
              stateOption => stateOption.label === result.state,
            );
            if (possibleState) {
              setValue(UserDataAttribute.state, possibleState);
            }
          } else {
            setValue(UserDataAttribute.state, result.state);
          }
        }
        if (result.zip) {
          setValue(UserDataAttribute.zip, result.zip);
        }
      }
    }
  };

  return (
    <>
      {!hideNavHeader && <NavigationHeader />}
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmitFormData)}>
          {!hideTitle && (
            <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          )}
          <CountryField onChange={handleCountryChange} />
          <AddressInput
            country={country.value}
            hasError={!!errors[UserDataAttribute.addressLine1]}
            hint={
              errors[UserDataAttribute.addressLine1] &&
              t('form.address-line-1.error')
            }
            label={t('form.address-line-1.label')}
            onSelect={handleAddressSelect}
            placeholder={t('form.address-line-1.placeholder')}
            {...register(UserDataAttribute.addressLine1, { required: true })}
          />
          <TextInput
            autoComplete="address-line2"
            label={t('form.address-line-2.label')}
            placeholder={t('form.address-line-2.placeholder')}
            {...register(UserDataAttribute.addressLine2)}
          />
          <Grid.Row>
            <Grid.Column col={6}>
              <TextInput
                autoComplete="address-level2"
                hasError={!!errors[UserDataAttribute.city]}
                hint={errors[UserDataAttribute.city] && t('form.city.error')}
                label={t('form.city.label')}
                placeholder={t('form.city.placeholder')}
                {...register(UserDataAttribute.city, { required: true })}
              />
            </Grid.Column>
            <Grid.Column col={6}>
              <ZipField countryCode={country.value} />
            </Grid.Column>
          </Grid.Row>
          {country.value === 'US' ? (
            <Controller
              control={control}
              name={UserDataAttribute.state}
              render={({ field }) => {
                const value =
                  typeof field.value === 'object' ? field.value : undefined;
                return (
                  <Select
                    label={t('form.state.label')}
                    onBlur={field.onBlur}
                    options={STATES}
                    onChange={nextOption => {
                      field.onChange(nextOption);
                    }}
                    placeholder={t('form.state.placeholder')}
                    value={value}
                  />
                );
              }}
            />
          ) : (
            <TextInput
              autoComplete="address-level1"
              hasError={!!errors[UserDataAttribute.state]}
              hint={errors[UserDataAttribute.state] && t('form.state.error')}
              label={t('form.state.label')}
              placeholder={t('form.state.placeholder')}
              {...register(UserDataAttribute.state)}
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
