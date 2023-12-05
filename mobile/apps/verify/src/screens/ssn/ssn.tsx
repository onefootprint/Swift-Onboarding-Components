import { zodResolver } from '@hookform/resolvers/zod';
import { IcoShield40 } from '@onefootprint/icons';
import { type CollectKycDataRequirement, IdDI } from '@onefootprint/types';
import {
  Box,
  Button,
  Container,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components/native';
import * as z from 'zod';

import Header from '@/components/header';
import type { SyncDataFieldErrors } from '@/hooks/use-sync-data';
import useSyncData from '@/hooks/use-sync-data';
import useTranslation from '@/hooks/use-translation';
import type { KycData } from '@/types';

import type { FormData } from './types';
import convertFormData from './utils/convert-form-data';
import { getSsnKind } from './utils/ssn-utils';

export type SsnProps = {
  kycData: KycData;
  requirement: CollectKycDataRequirement;
  authToken: string;
  onComplete: (data: KycData) => void;
};

const Ssn = ({ kycData, requirement, authToken, onComplete }: SsnProps) => {
  const { t } = useTranslation('pages.ssn');
  const {
    mutation: { isLoading },
    syncData,
  } = useSyncData();
  const ssnKind = getSsnKind(requirement);
  const validations = {
    full: z
      .string()
      .min(1, { message: t('form.errors.required') })
      .max(11, { message: t('form.errors.invalid') })
      .refine(
        value => {
          const pattern =
            /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/;
          return pattern.test(value);
        },
        { message: t('form.errors.invalid') },
      ),
    last4: z
      .string()
      .min(1, { message: t('form.errors.required') })
      .max(4, { message: t('form.errors.invalid') }),
  };
  const schema = z.object({
    ssn: ssnKind === 'ssn-full' ? validations.full : validations.last4,
  });
  const { control, handleSubmit, setError } = useForm<FormData>({
    defaultValues: {
      ssn: kycData[ssnKind === 'ssn-full' ? IdDI.ssn9 : IdDI.ssn4]?.value,
    },
    resolver: zodResolver(schema),
  });
  // TODO: implement optional ssn and ssn skip
  // TODO: skip case for doc stepup implement

  const handleSyncDataError = (error: SyncDataFieldErrors) => {
    Object.entries(error).forEach(([k, message]) => {
      const di = k as IdDI;
      if (di === IdDI.ssn9 || di === IdDI.ssn4) {
        setError(
          'ssn',
          { message },
          {
            shouldFocus: true,
          },
        );
      }
    });
  };

  const onSubmit = (formData: FormData) => {
    const convertedData = convertFormData({
      requirement,
      data: kycData,
      formData,
    });
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
        {ssnKind === 'ssn-full' ? (
          <Controller
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => {
              return (
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  blurOnSubmit
                  enterKeyHint="send"
                  hasError={!!error}
                  hint={error?.message}
                  inputMode="text"
                  label={t('form.full.label')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  placeholder={t('form.full.placeholder')}
                  private
                  value={value}
                />
              );
            }}
            name="ssn"
          />
        ) : (
          <Controller
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => {
              return (
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  blurOnSubmit
                  enterKeyHint="send"
                  hasError={!!error}
                  hint={error?.message}
                  inputMode="text"
                  label={t('form.last-4.label')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  placeholder={t('form.last-4.placeholder')}
                  private
                  value={value}
                />
              );
            }}
            name="ssn"
          />
        )}
        {ssnKind === 'ssn-full' && (
          <Disclaimer>
            <IcoShield40 />
            <Box gap={3} paddingTop={1} flex={1}>
              <Typography variant="label-3">
                {t('form.disclaimer.title')}
              </Typography>
              <Typography variant="body-3" color="secondary">
                {t('form.disclaimer.description')}
              </Typography>
            </Box>
          </Disclaimer>
        )}
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

const Disclaimer = styled.View`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]};
  `}
`;

export default Ssn;
