import { zodResolver } from '@hookform/resolvers/zod';
import type { ObConfigAuth } from '@onefootprint/types';
import { Box, Button, Container, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import isMobilePhone from 'validator/lib/isMobilePhone';
import * as z from 'zod';

import useIdentify from '@/hooks/use-identify';
import useRequestErrorToast from '@/hooks/use-request-error-toast';
import useTranslation from '@/hooks/use-translation';
import type { IdentifyResultProps } from '@/utils/state-machine/types';

import Header from '../../components/header';
import EmailPreview from './components/email-preview';

export type PhoneIdentificationProps = {
  email?: string;
  onEmailEdit: () => void;
  onComplete: (result: IdentifyResultProps) => void;
  obConfigAuth: ObConfigAuth;
};

type FormData = {
  phoneNumber: string;
};

const PhoneIdentification = ({
  email,
  onComplete,
  obConfigAuth,
  onEmailEdit,
}: PhoneIdentificationProps) => {
  const { t } = useTranslation('pages.phone-identification');
  const schema = z.object({
    phoneNumber: z
      .string()
      .min(1, { message: t('form.phone-number.errors.required') })
      .refine(isMobilePhone, {
        message: t('form.phone-number.errors.invalid'),
      }),
  });
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { phoneNumber: '' },
    resolver: zodResolver(schema),
  });
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();

  const onSubmit = (data: FormData) => {
    const { phoneNumber } = data;
    identifyMutation.mutate(
      {
        identifier: { phoneNumber },
        obConfigAuth,
      },
      {
        onSuccess: response => {
          const {
            userFound,
            isUnverified,
            availableChallengeKinds,
            hasSyncablePassKey,
          } = response;
          onComplete({
            userFound,
            isUnverified,
            phoneNumber,
            hasSyncablePassKey,
            availableChallengeKinds,
            successfulIdentifier: { phoneNumber },
          });
        },
        onError: error => showRequestErrorToast(error),
      },
    );
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <EmailPreview email={email} onEdit={onEmailEdit} />
      <Box gap={7} marginBottom={7}>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <TextInput
                autoFocus
                autoCapitalize="none"
                autoComplete="tel"
                autoCorrect={false}
                blurOnSubmit
                enterKeyHint="send"
                hasError={!!error}
                hint={error?.message}
                inputMode="tel"
                keyboardType="phone-pad"
                label={t('form.phone-number.label')}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder={t('form.phone-number.placeholder')}
                private
                textContentType="telephoneNumber"
                value={value}
              />
            );
          }}
          name="phoneNumber"
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

export default PhoneIdentification;
