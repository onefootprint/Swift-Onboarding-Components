import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import validator from 'validator';
import * as z from 'zod';

import useTranslation from '@/hooks/use-translation';

import Header from '../../components/header';
import EmailPreview from './components/email-preview';

export type PhoneIdentificationProps = {
  onDone: () => void;
};

type FormData = {
  phoneNumber: string;
};

const PhoneIdentification = ({ onDone }: PhoneIdentificationProps) => {
  const { t } = useTranslation('pages.phone-identification');
  const schema = z.object({
    phoneNumber: z
      .string()
      .min(1, { message: t('form.phone-number.errors.required') })
      .refine(validator.isMobilePhone, {
        message: t('form.phone-number.errors.invalid'),
      }),
  });
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { phoneNumber: '' },
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    // TODO: Implement
    onDone();
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <EmailPreview email="test@email.com" />
      <Box gap={7} marginBottom={7}>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            console.log(error);
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

        <Button variant="primary" onPress={handleSubmit(onSubmit)}>
          {t('form.cta')}
        </Button>
      </Box>
    </Container>
  );
};

export default PhoneIdentification;
