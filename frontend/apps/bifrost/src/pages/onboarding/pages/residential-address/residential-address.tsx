import { HeaderTitle } from 'footprint-ui';
import { STATES } from 'global-constants';
import { useTranslation } from 'hooks';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import {
  AddressInput,
  Button,
  CountrySelect,
  CountrySelectOption,
  Grid,
  Select,
  SelectOption,
  TextInput,
} from 'ui';

import ProgressHeader from '../../components/progress-header';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import useSyncData from '../../hooks/use-sync-data';
import useInputValidations from './hooks/use-input-validations';
import getAddressComponent from './utils/get-address-components';
import getInitialCountry from './utils/get-initial-country';
import getInitialState from './utils/get-initial-state';

type FormData = {
  [UserDataAttribute.streetAddress]: string;
  [UserDataAttribute.streetAddress2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string | SelectOption;
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
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.country]: getInitialCountry(
        data[UserDataAttribute.country],
      ),
      [UserDataAttribute.state]: getInitialState(data[UserDataAttribute.state]),
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
      state:
        typeof formData.state === 'object'
          ? formData.state.value
          : formData.state,
    };
    send({
      type: Events.residentialAddressSubmitted,
      payload: {
        residentialAddress,
      },
    });
    syncDataMutation(residentialAddress);
  };

  const handleCountryChange = () => {
    setFocus(UserDataAttribute.streetAddress);
    setValue(UserDataAttribute.streetAddress, '');
    setValue(UserDataAttribute.streetAddress2, '');
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
        setValue(UserDataAttribute.streetAddress, formattedStreetAddress);
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
                handleCountryChange();
              }}
              placeholder={t('form.country.placeholder')}
              value={field.value}
            />
          )}
        />
        <AddressInput
          country={country.value}
          hasError={!!errors.streetAddress}
          hintText={errors.streetAddress && t('form.address-line-1.error')}
          label={t('form.address-line-1.label')}
          onSelect={handleAddressSelect}
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
