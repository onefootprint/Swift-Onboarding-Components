import { zodResolver } from '@hookform/resolvers/zod';
import type { CollectKycDataRequirement, CountryCode, PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI, isCountryCode } from '@onefootprint/types';
import type { AddressPrediction, SelectRef } from '@onefootprint/ui';
import { Box } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { type TextInput as RNTextInput } from 'react-native';
import styled, { css } from 'styled-components/native';
import * as z from 'zod';

import DataCollectionActionButton from '@/components/data-collection-action-button';
import Header from '@/components/header';
import states from '@/constants/states';
import type { SyncDataFieldErrors } from '@/hooks/use-sync-data';
import useSyncData from '@/hooks/use-sync-data';
import useTranslation from '@/hooks/use-translation';
import type { KycData } from '@/types';
import getInitialCountry from '@/utils/get-initial-country';
import getInitialState from '@/utils/get-initial-state';

import AddressLinesInput from './components/address-lines-input';
import CityInput from './components/city-input';
import CountryInput from './components/country-input';
import StateInput from './components/state-input';
import ZipInput from './components/zip-input/zip-input';
import type { FormData } from './types';
import convertFormData from './utils/convert-form-data';
import getAddressComponent from './utils/get-address-components';

export type ResidentialAddressProps = {
  requirement: CollectKycDataRequirement;
  authToken: string;
  config: PublicOnboardingConfig;
  kycData: KycData;
  onComplete: (data: KycData) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
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
  onCancel,
  hideHeader,
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
  } else if (config.allowInternationalResidents && config.supportedCountries && config.supportedCountries.length > 0) {
    [defaultCountry] = config.supportedCountries;
  }

  const schema = z.object({
    country: z.object({
      label: z.string().min(1, { message: t('form.country.errors.required') }),
      value: z.string().min(1, { message: t('form.country.errors.required') }),
    }),
    addressLine1: z.string().min(1, { message: t('form.address-line1.errors.required') }),
    addressLine2: z.optional(z.string()),
    city: z.string().min(1, { message: t('form.city.errors.required') }),
    // TODO:
    // Add validation if country is US
    // https://linear.app/footprint/issue/FP-6738/add-validation-to-zipcode-if-country-is-us
    zip: z.string().min(1, { message: t('form.zip.errors.required') }),
    // TODO:
    // If not US, we should display a text input instead
    // https://linear.app/footprint/issue/FP-6739/if-country-is-not-us-state-should-be-a-text-input-field-instead
    state: z
      .object({
        label: z.string().min(1, { message: t('form.state.errors.required') }),
        value: z.string().min(1, { message: t('form.state.errors.required') }),
      })
      .or(z.string().min(1, { message: t('form.state.errors.required') })),
  });
  const { control, setValue, watch, handleSubmit, resetField, setFocus, setError } = useForm<FormData>({
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

  const country = watch('country') ?? defaultCountry;
  const addressLine2Ref = useRef<RNTextInput>(null);
  const cityRef = useRef<RNTextInput>(null);
  const zipRef = useRef<RNTextInput>(null);
  const stateRef = useRef<SelectRef | RNTextInput>(null);

  const handleCountryChange = () => {
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
    setFocus('addressLine1');
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

  const handleAddressSelect = async (prediction?: AddressPrediction | null) => {
    if (!prediction) return;
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
    const formattedStreetAddress = prediction?.structured_formatting.main_text;
    if (formattedStreetAddress) {
      setValue('addressLine1', formattedStreetAddress);
    }
    const result = await getAddressComponent(prediction.place_id);
    if (result) {
      if (result.city) {
        setValue('city', result.city);
      }
      if (result.state) {
        if (country.value === 'US') {
          const possibleState = states.find(stateOption => stateOption.label === result.state);
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
    <Box>
      {!hideHeader && <Header title={t('title')} subtitle={t('subtitle')} />}
      <Box gap={7}>
        <CountryInput
          control={control}
          supportedCountries={config.supportedCountries}
          onCountryChange={handleCountryChange}
        />
        <AddressLinesInput
          control={control}
          country={country}
          onAddressSelect={handleAddressSelect}
          addressLine2Ref={addressLine2Ref}
        />
        <Row>
          <CityInput control={control} currInputRef={cityRef} nextInputRef={zipRef} />
          <ZipInput control={control} currInputRef={zipRef} nextInputRef={stateRef} />
        </Row>
        <StateInput control={control} stateRef={stateRef} country={country} />
        <DataCollectionActionButton onComplete={handleSubmit(onSubmit)} isLoading={isLoading} onCancel={onCancel} />
      </Box>
    </Box>
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
