import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, TextInput } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { TextInput as RNTextInput } from 'react-native';
import styled, { css } from 'styled-components/native';
import * as z from 'zod';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

import {
  validateDateFormat,
  validateMinimumAge,
  validateNotFutureDate,
  validateYearOfBirth,
} from './utils/validations';

export type BasicInformationProps = {
  onDone: () => void;
};

type FormData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
};

const BasicInformation = ({ onDone }: BasicInformationProps) => {
  const { t } = useTranslation('pages.basic-information');
  const schema = z.object({
    firstName: z
      .string()
      .min(1, { message: t('form.first-name.errors.required') }),
    lastName: z
      .string()
      .min(1, { message: t('form.last-name.errors.required') }),
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
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { firstName: '', middleName: '', lastName: '', dob: '' },
    resolver: zodResolver(schema),
  });
  const middleNameRef = useRef<RNTextInput>(null);
  const lastNameRef = useRef<RNTextInput>(null);
  const dobRef = useRef<RNTextInput>(null);

  const onSubmit = (formData: FormData) => {
    // TODO: Implement backend call
    console.log(formData);
    onDone();
  };

  // TODO: we don't always show country of birth, so we should make this dynamic
  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
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
                    autoComplete="name-given"
                    autoCorrect={false}
                    blurOnSubmit={false}
                    enterKeyHint="next"
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
                  />
                );
              }}
              name="firstName"
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
                    autoComplete="name-middle-initial"
                    autoCorrect={false}
                    blurOnSubmit={false}
                    enterKeyHint="next"
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
                  />
                );
              }}
              name="middleName"
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
              <TextInput
                autoComplete="name-family"
                autoCorrect={false}
                blurOnSubmit={false}
                enterKeyHint="next"
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
              />
            );
          }}
          name="lastName"
        />
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => {
            return (
              <TextInput
                autoComplete="birthdate-day"
                autoCorrect={false}
                enterKeyHint="send"
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
              />
            );
          }}
          name="dob"
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

export default BasicInformation;
