import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import type { CountrySelectOption, SelectOption } from '@onefootprint/ui';
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
import * as z from 'zod';

import Header from '@/components/header';
import states from '@/constants/states';
import useTranslation from '@/hooks/use-translation';

export type ResidentialAddressProps = {
  onDone: () => void;
};

type FormData = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: CountrySelectOption;
  lastName: string;
  state: SelectOption<{ value: string; label: string }>;
  zip: string;
};

const ResidentialAddress = ({ onDone }: ResidentialAddressProps) => {
  const { t } = useTranslation('pages.residential-address');
  const schema = z.object({
    country: z.object({
      label: z.string().min(1, { message: t('form.country.errors.required') }),
      value: z.string().min(1, { message: t('form.country.errors.required') }),
    }),
    addressLine1: z
      .string()
      .min(1, { message: t('form.address-line1.errors.required') }),
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
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      country: DEFAULT_COUNTRY,
      state: undefined,
      zip: undefined,
    },
    resolver: zodResolver(schema),
  });
  const addressLine1Ref = useRef<RNTextInput>(null);
  const addressLine2Ref = useRef<RNTextInput>(null);
  const cityRef = useRef<RNTextInput>(null);
  const zipRef = useRef<RNTextInput>(null);
  const stateRef = useRef(null);

  const onSubmit = (formData: FormData) => {
    // TODO: Implement backend call
    console.log(formData);
    onDone();
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
                hint={error?.message}
                label={t('form.country.label')}
                onBlur={onBlur}
                value={value}
                onChange={newValue => {
                  onChange(newValue);
                }}
                searchInputProps={{
                  placeholder: t('form.country.placeholder'),
                  enterKeyHint: 'next',
                  autoComplete: 'country',
                  textContentType: 'countryName',
                }}
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
                onSubmitEditing={() => cityRef.current?.focus()}
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

        <Button variant="primary" onPress={handleSubmit(onSubmit)}>
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
