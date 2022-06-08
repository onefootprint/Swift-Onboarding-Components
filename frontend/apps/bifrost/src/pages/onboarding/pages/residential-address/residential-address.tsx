import { DEFAULT_COUNTRY, STATES } from 'global-constants';
import { useTranslation } from 'hooks';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import HeaderTitle from 'src/components/header-title';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import {
  AddressInput,
  Button,
  CountrySelect,
  CountrySelectOption,
  Grid,
  Select,
  TextInput,
} from 'ui';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import useSyncData from '../../hooks/use-sync-data';

type FormData = Required<
  Pick<
    UserData,
    | UserDataAttribute.streetAddress
    | UserDataAttribute.streetAddress2
    | UserDataAttribute.city
    | UserDataAttribute.state
    | UserDataAttribute.country
    | UserDataAttribute.zip
  >
>;

const ResidentialAddress = () => {
  const [, send] = useOnboardingMachine();
  const syncDataMutation = useSyncData();
  const { t } = useTranslation('pages.registration.residential-address');
  const {
    control,
    register,
    handleSubmit,
    resetField,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: DEFAULT_COUNTRY.value,
    },
  });
  const country = watch('country');
  const shouldDisplayStateSelect = country === DEFAULT_COUNTRY.value;

  const onSubmit = (formData: FormData) => {
    const residentialAddress = {
      streetAddress: formData.streetAddress,
      streetAddress2: formData.streetAddress2,
      city: formData.city,
      zip: formData.zip,
      country: formData.country,
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
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Controller
        control={control}
        name={UserDataAttribute.country}
        render={({ field: { onChange, value } }) => (
          <CountrySelect
            label={t('form.country.label')}
            onChange={(nextSelectedOption: CountrySelectOption | null) => {
              resetField(UserDataAttribute.state);
              onChange(nextSelectedOption?.value);
            }}
            placeholder={t('form.country.placeholder')}
            value={value}
          />
        )}
      />
      <AddressInput
        hasError={!!errors.streetAddress}
        hintText={errors.streetAddress && t('form.address-line-1.error')}
        label={t('form.address-line-1.label')}
        placeholder={t('form.address-line-1.placeholder')}
        {...register(UserDataAttribute.streetAddress, { required: true })}
      />
      <TextInput
        label={t('form.address-line-2.label')}
        placeholder={t('form.address-line-2.placeholder')}
        {...register(UserDataAttribute.streetAddress2)}
      />
      <Grid.Row>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.city}
            hintText={errors.city && t('form.city.error')}
            label={t('form.city.label')}
            placeholder={t('form.city.placeholder')}
            {...register(UserDataAttribute.city, { required: true })}
          />
        </Grid.Column>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.zip}
            hintText={errors.zip && t('form.zipCode.error')}
            label={t('form.zipCode.label')}
            placeholder={t('form.zipCode.placeholder')}
            {...register(UserDataAttribute.zip, { required: true })}
          />
        </Grid.Column>
      </Grid.Row>
      {shouldDisplayStateSelect ? (
        <Controller
          control={control}
          name={UserDataAttribute.state}
          render={({ field: { value, onChange } }) => (
            <Select
              label={t('form.state.label')}
              onChange={nextSelectedOption => {
                onChange(nextSelectedOption?.value);
              }}
              options={STATES}
              placeholder={t('form.state.placeholder')}
              value={value}
            />
          )}
        />
      ) : (
        <TextInput
          hasError={!!errors.state}
          hintText={errors.state && t('form.state.error')}
          label={t('form.state.label')}
          placeholder={t('form.state.placeholder')}
          {...register(UserDataAttribute.state)}
        />
      )}
      <Button type="submit" fullWidth>
        {t('form.cta')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default ResidentialAddress;
