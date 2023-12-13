import { zodResolver } from '@hookform/resolvers/zod';
import type { ObConfigAuth } from '@onefootprint/types';
import { Box, DismissKeyboard, TextInput, Typography } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import DataCollectionActionButton from '@/components/data-collection-action-button';
import useIdentify from '@/hooks/use-identify';
import useRequestErrorToast from '@/hooks/use-request-error-toast';
import useTranslation from '@/hooks/use-translation';
import type { IdentifyResultProps } from '@/utils/state-machine/types';

export type EmailIdentificationProps = {
  onComplete: (result: IdentifyResultProps) => void;
  obConfigAuth: ObConfigAuth;
};

type FormData = {
  email: string;
};

const EmailIdentification = ({
  onComplete,
  obConfigAuth,
}: EmailIdentificationProps) => {
  const { t } = useTranslation('pages.email-identification');
  const schema = z.object({
    email: z
      .string()
      .min(1, { message: t('form.email.errors.required') })
      .email({ message: t('form.email.errors.invalid') }),
  });
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });
  const { isLoading, mutate } = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();

  const onSubmit = (data: FormData) => {
    const { email } = data;
    mutate(
      {
        identifier: { email },
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
            email,
            hasSyncablePassKey,
            availableChallengeKinds,
            successfulIdentifier: { email },
          });
        },
        onError: error => showRequestErrorToast(error),
      },
    );
  };

  return (
    <DismissKeyboard>
      <Box gap={3} marginBottom={7}>
        <Typography color="primary" variant="heading-3" center>
          {t('title')}
        </Typography>
        <Typography color="primary" variant="body-2" center>
          {t('subtitle')}
        </Typography>
      </Box>
      <Box marginBottom={7}>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
                blurOnSubmit
                enterKeyHint="send"
                hasError={!!error}
                hint={error?.message}
                inputMode="email"
                label={t('form.email.label')}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder={t('form.email.placeholder')}
                private
                textContentType="emailAddress"
                value={value}
              />
            );
          }}
          name="email"
        />
      </Box>
      <DataCollectionActionButton
        onComplete={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </DismissKeyboard>
  );
};

export default EmailIdentification;
