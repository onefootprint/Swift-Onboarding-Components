import { zodResolver } from '@hookform/resolvers/zod';
import { COUNTRIES } from '@onefootprint/global-constants';
import type {
  CollectKycDataRequirement,
  CountryCode,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { IdDI, isCountryCode } from '@onefootprint/types';
import type { SelectRef } from '@onefootprint/ui';
import {
  Box,
  Button,
  Container,
  CountrySelect,
  Select,
  TextInput,
} from '@onefootprint/ui';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type TextInput as RNTextInput } from 'react-native';
import styled, { css } from 'styled-components/native';
import * as z from 'zod';

import Header from '@/components/header';
import states from '@/constants/states';
import type { SyncDataFieldErrors } from '@/hooks/use-sync-data';
import useSyncData from '@/hooks/use-sync-data';
import useTranslation from '@/hooks/use-translation';
import type { KycData } from '@/types';
import getInitialCountry from '@/utils/get-initial-country';
import getInitialState from '@/utils/get-initial-state';

import type { FormData } from './types';
import convertFormData from './utils/convert-form-data';

export type ResidentialAddressProps = {
  requirement: CollectKycDataRequirement;
  authToken: string;
  config: PublicOnboardingConfig;
  kycData: KycData;
  onComplete: (data: KycData) => void;
};

const fieldByDi: Partial<Record<IdDI, keyof FormData>> = {
  [IdDI.country]: 'country',
  [IdDI.state]: 'state',
  [IdDI.city]: 'city',
  [IdDI.zip]: 'zip',
  [IdDI.addressLine1]: 'addressLine1',
  [IdDI.addressLine2]: 'addressLine2',
};

const ResidentialAddress = ({
  requirement,
  authToken,
  config,
  kycData,
  onComplete,
}: ResidentialAddressProps) => {
  const { t } = useTranslation('pages.residential-address');
  const countryFromContext = kycData[IdDI.country]?.value;
  const {
    mutation: { isLoading },
    syncData,
  } = useSyncData();

  let defaultCountry: CountryCode | undefined;
  if (countryFromContext && isCountryCode(countryFromContext)) {
    defaultCountry = countryFromContext;
  } else if (
    config.allowInternationalResidents &&
    config.supportedCountries &&
    config.supportedCountries.length > 0
  ) {
    [defaultCountry] = config.supportedCountries;
  }

  const allowedCountries = new Set(config.supportedCountries);
  const shouldDisableCountry = allowedCountries.size === 1;
  const countryOptions = COUNTRIES.filter(entry =>
    allowedCountries.has(entry.value),
  );
  // TODO: We need to update l10n using locale on country change

  const schema = z.object({
    country: z.object({
      label: z.string().min(1, { message: t('form.country.errors.required') }),
      value: z.string().min(1, { message: t('form.country.errors.required') }),
    }),
    addressLine1: z
      .string()
      .min(1, { message: t('form.address-line1.errors.required') }),
    addressLine2: z.string(),
    city: z.string().min(1, { message: t('form.city.errors.required') }),
    // TODO:
    // Add validation if country is US
    // https://linear.app/footprint/issue/FP-6738/add-validation-to-zipcode-if-country-is-us
    zip: z.string().min(1, { message: t('form.zip.errors.required') }),
    // TODO:
    // If not US, we should display a text input instead
    // https://linear.app/footprint/issue/FP-6739/if-country-is-not-us-state-should-be-a-text-input-field-instead
    state: z.object({
      label: z.string().min(1, { message: t('form.state.errors.required') }),
      value: z.string().min(1, { message: t('form.state.errors.required') }),
    }),
  });
  const { control, handleSubmit, resetField, setFocus, setError } =
    useForm<FormData>({
      defaultValues: {
        addressLine1: kycData[IdDI.addressLine1]?.value,
        addressLine2: kycData[IdDI.addressLine2]?.value,
        city: kycData[IdDI.city]?.value,
        country: getInitialCountry(defaultCountry),
        state: getInitialState(kycData[IdDI.state]?.value),
        zip: kycData[IdDI.zip]?.value,
      },
      resolver: zodResolver(schema),
    });
  const addressLine1Ref = useRef<RNTextInput>(null);
  const addressLine2Ref = useRef<RNTextInput>(null);
  const cityRef = useRef<RNTextInput>(null);
  const zipRef = useRef<RNTextInput>(null);
  const stateRef = useRef<SelectRef>(null);

  const handleCountryChange = () => {
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
    setFocus('addressLine1'); // TODO: this line doesn't have any effect on mobile for some reason. It works on web. Test it.
  };

  const handleSyncDataError = (error: SyncDataFieldErrors) => {
    Object.entries(error).forEach(([k, message]) => {
      const di = k as IdDI;
      const field = fieldByDi[di];
      if (field) {
        setError(
          field,
          { message },
          {
            shouldFocus: true,
          },
        );
      }
    });
  };

  const onSubmit = (formData: FormData) => {
    const convertedData = convertFormData({ data: kycData, formData });
    syncData({
      data: convertedData,
      speculative: true,
      requirement,
      authToken,
      onSuccess: () => {
        onComplete(convertedData);
      },
      onError: handleSyncDataError,
    });
  };

  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <CountrySelect
                hasError={!!error}
                hint={
                  shouldDisableCountry && value
                    ? t('form.country.disabled-hint', {
                        countryName: value.label,
                      })
                    : error?.message
                }
                label={t('form.country.label')}
                onBlur={onBlur}
                value={value}
                options={countryOptions}
                onChange={newValue => {
                  onChange(newValue);
                  handleCountryChange();
                }}
                searchInputProps={{
                  placeholder: t('form.country.placeholder'),
                  enterKeyHint: 'next',
                  autoComplete: 'country',
                  textContentType: 'countryName',
                }}
                disabled={shouldDisableCountry}
              />
            );
          }}
          name="country"
        />
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <TextInput
                autoComplete="address-line1"
                autoFocus
                blurOnSubmit={false}
                enterKeyHint="next"
                hasError={!!error}
                hint={error?.message}
                inputMode="text"
                label={t('form.address-line1.label')}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => addressLine2Ref.current?.focus()}
                placeholder={t('form.address-line1.placeholder')}
                private
                ref={addressLine1Ref}
                textContentType="streetAddressLine1"
                value={value}
              />
            );
          }}
          name="addressLine1"
        />
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <TextInput
                autoComplete="address-line2"
                blurOnSubmit={false}
                enterKeyHint="next"
                hasError={!!error}
                hint={error?.message}
                inputMode="text"
                label={t('form.address-line2.label')}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => addressLine2Ref.current?.focus()}
                placeholder={t('form.address-line2.placeholder')}
                private
                ref={addressLine2Ref}
                textContentType="streetAddressLine2"
                value={value}
              />
            );
          }}
          name="addressLine2"
        />
        <Row>
          <Box flex={1}>
            <Controller
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => {
                return (
                  <TextInput
                    autoComplete="address-line1"
                    blurOnSubmit={false}
                    enterKeyHint="next"
                    hasError={!!error}
                    hint={error?.message}
                    inputMode="text"
                    label={t('form.city.label')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={() => zipRef.current?.focus()}
                    placeholder={t('form.city.placeholder')}
                    private
                    ref={cityRef}
                    textContentType="addressCity"
                    value={value}
                  />
                );
              }}
              name="city"
            />
          </Box>
          <Box flex={1}>
            <Controller
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => {
                return (
                  <TextInput
                    autoComplete="postal-code"
                    blurOnSubmit
                    enterKeyHint="next"
                    hasError={!!error}
                    hint={error?.message}
                    inputMode="text"
                    label={t('form.zip.label')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={() => {
                      stateRef.current?.focus();
                    }}
                    placeholder={t('form.zip.placeholder')}
                    private
                    ref={zipRef}
                    textContentType="postalCode"
                    value={value}
                  />
                );
              }}
              name="zip"
            />
          </Box>
        </Row>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <Select
                hasError={!!error}
                hint={error?.message}
                label={t('form.state.label')}
                onBlur={onBlur}
                onChange={newValue => {
                  onChange(newValue);
                }}
                options={states}
                ref={stateRef}
                value={value}
                searchInputProps={{
                  autoComplete: 'postal-address-locality',
                  enterKeyHint: 'next',
                  placeholder: t('form.state.placeholder'),
                  textContentType: 'addressState',
                }}
              />
            );
          }}
          name="state"
        />

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        >
          {t('form.cta')}
        </Button>
      </Box>
    </Container>
  );
};

const Row = styled.View`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: row;
  `}
`;

export default ResidentialAddress;
