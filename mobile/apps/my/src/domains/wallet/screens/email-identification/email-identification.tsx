import { ChallengeKind } from '@onefootprint/types';
import {
  Box,
  Button,
  Container,
  DismissKeyboard,
  TextInput,
  Typography,
  useToast,
} from '@onefootprint/ui';
import * as Linking from 'expo-linking';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

import useIdentify from './hooks/use-identify';

type EmailIdentificationProps = ScreenProps<'EmailIdentification'>;

type FormData = {
  email: string;
};

const EmailIdentification = ({ navigation }: EmailIdentificationProps) => {
  const { t } = useTranslation('screens.email-identification');
  const toast = useToast();
  const identifyMutation = useIdentify();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: '' },
  });

  const onSubmit = ({ email }) => {
    identifyMutation.mutate(
      { identifier: { email } },
      {
        onSuccess: ({ userFound, availableChallengeKinds }) => {
          if (!userFound) {
            return toast.show({
              variant: 'error',
              title: t('user-not-found.title'),
              description: t('user-not-found.description'),
              cta: {
                label: t('user-not-found.cta'),
                onPress: () =>
                  Linking.openURL('https://live.onefootprint.com/'),
              },
            });
          }
          navigation.push('Login', {
            canUseBiometric: availableChallengeKinds.includes(
              ChallengeKind.biometric,
            ),
          });
        },
      },
    );
  };

  return (
    <Container>
      <Box center marginBottom={8} marginTop={10}>
        <Typography variant="heading-3" marginBottom={3}>
          {t('title')}
        </Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Box>
      <DismissKeyboard>
        <Box gap={7}>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                blurOnSubmit
                hasError={!!errors.email}
                hint={errors.email && t('form.email.errors.required')}
                inputMode="email"
                label={t('form.email.label')}
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(onSubmit)}
                placeholder={t('form.email.placeholder')}
                returnKeyType="send"
                spellCheck={false}
                value={value}
              />
            )}
            name="email"
          />
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={identifyMutation.isLoading}
          >
            {t('form.cta')}
          </Button>
        </Box>
      </DismissKeyboard>
    </Container>
  );
};

export default EmailIdentification;
