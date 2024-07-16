import { zodResolver } from '@hookform/resolvers/zod';
import { type CollectKycDataRequirement, CollectedKycDataOption, IdDI } from '@onefootprint/types';
import { Box, TextInput } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';
import styled, { css } from 'styled-components/native';
import * as z from 'zod';

import DataCollectionActionButton from '@/components/data-collection-action-button';
import Header from '@/components/header';
import type { SyncDataFieldErrors } from '@/hooks/use-sync-data';
import useSyncData from '@/hooks/use-sync-data';
import useTranslation from '@/hooks/use-translation';
import type { KycData } from '@/types';

import allAttributes from '../../utils/all-attributes';
import type { FormData } from './types';
import convertFormData from './utils/convert-form-data';
import {
  validateDateFormat,
  validateMinimumAge,
  validateName,
  validateNotFutureDate,
  validateYearOfBirth,
} from './utils/validations';

export type BasicInformationProps = {
  requirement: CollectKycDataRequirement;
  data?: KycData;
  authToken: string;
  onComplete: (data: KycData) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
};

const fieldByDi: Partial<Record<IdDI, keyof FormData>> = {
  [IdDI.firstName]: 'firstName',
  [IdDI.middleName]: 'middleName',
  [IdDI.lastName]: 'lastName',
  [IdDI.dob]: 'dob',
};

const BasicInformation = ({
  onComplete,
  requirement,
  authToken,
  data,
  onCancel,
  hideHeader,
}: BasicInformationProps) => {
  const { t } = useTranslation('pages.basic-information');
  const { mutation, syncData } = useSyncData();
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const isNameDisabled = data?.[IdDI.firstName]?.disabled || data?.[IdDI.lastName]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  // TODO: add support to show country of birth

  const schema = z.object({
    firstName: z
      .string()
      .min(1, { message: t('form.first-name.errors.required') })
      .regex(/\S/, { message: t('form.first-name.errors.required') })
      .refine(validateName, {
        message: t('form.first-name.errors.special-chars'),
      }),
    lastName: z
      .string()
      .min(1, { message: t('form.last-name.errors.required') })
      .regex(/\S/, { message: t('form.first-name.errors.required') })
      .refine(validateName, {
        message: t('form.first-name.errors.special-chars'),
      }),
    dob: z
      .string()
      .min(1, { message: t('form.dob.errors.required') })
      .refine(validateDateFormat, {
        message: t('form.dob.errors.invalid'),
      })
      .refine(validateYearOfBirth, {
        message: t('form.dob.errors.invalid'),
      })
      .refine(validateNotFutureDate, {
        message: t('form.dob.errors.future'),
      })
      .refine(validateMinimumAge, {
        message: t('form.dob.errors.min-age'),
      }),
  });
  const { control, handleSubmit, setError } = useForm<FormData>({
    defaultValues: {
      firstName: data?.[IdDI.firstName]?.value,
      middleName: data?.[IdDI.middleName]?.value,
      lastName: data?.[IdDI.lastName]?.value,
      dob: data?.[IdDI.dob]?.value,
    },
    resolver: zodResolver(schema),
  });
  const middleNameRef = useRef<RNTextInput>(null);
  const lastNameRef = useRef<RNTextInput>(null);
  const dobRef = useRef<RNTextInput>(null);

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
    const convertedData = convertFormData({ requirement, data, formData });
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

  // TODO: add support to show country of birth
  return (
    <Box width="100%">
      {!hideHeader && <Header title={t('title')} subtitle={t('subtitle')} />}
      <Box gap={7}>
        {requiresName && (
          <>
            <Row>
              <Box flex={1}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                    return (
                      <TextInput
                        autoComplete="name-given"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        returnKeyType="next"
                        hasError={!!error}
                        hint={error?.message}
                        inputMode="text"
                        label={t('form.first-name.label')}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        onSubmitEditing={() => middleNameRef.current?.focus()}
                        placeholder={t('form.first-name.placeholder')}
                        private
                        textContentType="givenName"
                        value={value}
                        disabled={isNameDisabled}
                      />
                    );
                  }}
                  name="firstName"
                />
              </Box>
              <Box flex={1}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                    return (
                      <TextInput
                        autoComplete="name-middle-initial"
                        autoCorrect={false}
                        blurOnSubmit={false}
                        returnKeyType="next"
                        hasError={!!error}
                        hint={error?.message}
                        inputMode="text"
                        label={t('form.middle-name.label')}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                        placeholder={t('form.middle-name.placeholder')}
                        private
                        ref={middleNameRef}
                        textContentType="middleName"
                        value={value}
                        disabled={isNameDisabled}
                      />
                    );
                  }}
                  name="middleName"
                />
              </Box>
            </Row>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                return (
                  <TextInput
                    autoComplete="name-family"
                    autoCorrect={false}
                    blurOnSubmit={false}
                    returnKeyType="next"
                    hasError={!!error}
                    hint={error?.message}
                    inputMode="text"
                    label={t('form.last-name.label')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={() => dobRef.current?.focus()}
                    placeholder={t('form.last-name.placeholder')}
                    private
                    ref={lastNameRef}
                    textContentType="familyName"
                    value={value}
                    disabled={isNameDisabled}
                  />
                );
              }}
              name="lastName"
            />
          </>
        )}
        {requiresDob && (
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
              return (
                <TextInput
                  autoComplete="birthdate-day"
                  autoCorrect={false}
                  returnKeyType="send"
                  hasError={!!error}
                  hint={error?.message}
                  inputMode="text"
                  label={t('form.dob.label')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  placeholder={t('form.dob.placeholder')}
                  private
                  ref={dobRef}
                  value={value}
                  disabled={isDobDisabled}
                />
              );
            }}
            name="dob"
          />
        )}
        <DataCollectionActionButton
          isLoading={mutation.isLoading}
          onComplete={handleSubmit(onSubmit)}
          onCancel={onCancel}
        />
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

export default BasicInformation;
