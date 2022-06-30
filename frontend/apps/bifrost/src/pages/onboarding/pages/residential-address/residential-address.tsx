import { DEFAULT_COUNTRY } from 'global-constants';
import { useTranslation } from 'hooks';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import HeaderTitle from 'src/components/header-title';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import {
  AddressInput,
  Button,
  CountrySelect,
  CountrySelectOption,
  Grid,
  TextInput,
} from 'ui';

import ProgressHeader from '../../components/progress-header';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import useSyncData from '../../hooks/use-sync-data';
import useInputValidations from './hooks/use-input-validations';

type FormData = {
  [UserDataAttribute.streetAddress]: string;
  [UserDataAttribute.streetAddress2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string;
  [UserDataAttribute.country]: CountrySelectOption;
  [UserDataAttribute.zip]: string;
};

const ResidentialAddress = () => {
  const [state, send] = useOnboardingMachine();
  const syncDataMutation = useSyncData();
  const { data } = state.context;
  const { t } = useTranslation('pages.registration.residential-address');
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: DEFAULT_COUNTRY,
      [UserDataAttribute.state]: data[UserDataAttribute.state],
      [UserDataAttribute.city]: data[UserDataAttribute.city],
      [UserDataAttribute.zip]: data[UserDataAttribute.zip],
      [UserDataAttribute.streetAddress]: data[UserDataAttribute.streetAddress],
      [UserDataAttribute.streetAddress2]:
        data[UserDataAttribute.streetAddress2],
    },
  });
  const country = watch(UserDataAttribute.country);
  const { zipcode } = useInputValidations(country.value);

  const onSubmit = (formData: FormData) => {
    const residentialAddress = {
      streetAddress: formData.streetAddress,
      streetAddress2: formData.streetAddress2,
      city: formData.city,
      zip: formData.zip,
      country: formData.country.value,
      state: formData.state,
    };
    send({
      type: Events.residentialAddressSubmitted,
      payload: {
        residentialAddress,
      },
    });
    syncDataMutation(residentialAddress);
  };

  return (
    <>
      <ProgressHeader />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Controller
          control={control}
          name={UserDataAttribute.country}
          render={({ field }) => (
            <CountrySelect
              label={t('form.country.label')}
              onBlur={field.onBlur}
              onChange={nextValue => {
                field.onChange(nextValue);
                setFocus(UserDataAttribute.streetAddress);
              }}
              placeholder={t('form.country.placeholder')}
              value={field.value}
            />
          )}
        />
        <AddressInput
          autoFocus
          country={country.value}
          hasError={!!errors.streetAddress}
          hintText={errors.streetAddress && t('form.address-line-1.error')}
          label={t('form.address-line-1.label')}
          placeholder={t('form.address-line-1.placeholder')}
          {...register(UserDataAttribute.streetAddress, { required: true })}
        />
        <TextInput
          autoComplete="address-line2"
          label={t('form.address-line-2.label')}
          placeholder={t('form.address-line-2.placeholder')}
          {...register(UserDataAttribute.streetAddress2)}
        />
        <Grid.Row>
          <Grid.Column col={6}>
            <TextInput
              autoComplete="address-level2"
              hasError={!!errors.city}
              hintText={errors.city && t('form.city.error')}
              label={t('form.city.label')}
              placeholder={t('form.city.placeholder')}
              {...register(UserDataAttribute.city, { required: true })}
            />
          </Grid.Column>
          <Grid.Column col={6}>
            <TextInput
              autoComplete="postal-code"
              hasError={!!errors.zip}
              hintText={errors.zip && t('form.zipCode.error')}
              label={t('form.zipCode.label')}
              mask={zipcode.mask}
              maxLength={zipcode.maxLength}
              minLength={zipcode.minLength}
              placeholder={t('form.zipCode.placeholder')}
              {...register(UserDataAttribute.zip, {
                required: true,
                pattern: zipcode.pattern,
              })}
            />
          </Grid.Column>
        </Grid.Row>
        <TextInput
          autoComplete="address-level1"
          hasError={!!errors.state}
          hintText={errors.state && t('form.state.error')}
          label={t('form.state.label')}
          placeholder={t('form.state.placeholder')}
          {...register(UserDataAttribute.state, { required: true })}
        />
        <Button type="submit" fullWidth>
          {t('form.cta')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default ResidentialAddress;
