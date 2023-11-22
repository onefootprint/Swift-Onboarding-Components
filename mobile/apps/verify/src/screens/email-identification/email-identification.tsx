import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Container,
  DismissKeyboard,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import useTranslation from '@/hooks/use-translation';

export type EmailIdentificationProps = {
  onDone: () => void;
};

type FormData = {
  email: string;
};

const EmailIdentification = ({ onDone }) => {
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

  const onSubmit = (data: FormData) => {
    console.log(data);
    // TODO: Implement
    onDone();
  };

  return (
    <Container>
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
        <Button variant="primary" onPress={handleSubmit(onSubmit)}>
          {t('form.cta')}
        </Button>
      </DismissKeyboard>
    </Container>
  );
};

export default EmailIdentification;
