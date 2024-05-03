import {
  Box,
  FormControl,
  FormLabel,
  NativeSelect,
  Text,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type {
  FormData,
  StepProps,
} from 'src/pages/proxy-configs/proxy-configs.types';

const BasicConfiguration = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.create.form.basic-configuration',
  });
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues: {
      name: values.name,
      accessReason: values.accessReason,
      method: values.method,
      url: values.url,
    },
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Text variant="label-2" marginBottom={5}>
        {t('title')}
      </Text>
      <Box gap={7} display="grid">
        <TextInput
          autoFocus
          hasError={!!formState.errors.name}
          hint={formState.errors.name?.message}
          label={t('name.label')}
          placeholder={t('name.placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('name.errors.required'),
            },
          })}
        />
        <TextInput
          hasError={!!formState.errors.url}
          hint={formState.errors.url?.message}
          label={t('url.label')}
          placeholder={t('url.placeholder')}
          type="url"
          {...register('url', {
            required: {
              value: true,
              message: t('url.errors.required'),
            },
          })}
        />
        <FormControl>
          <FormLabel htmlFor="method">{t('method.label')}</FormLabel>
          <NativeSelect
            id="method"
            {...register('method', {
              required: {
                value: true,
                message: t('method.errors.required'),
              },
            })}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </NativeSelect>
        </FormControl>
        <TextInput
          hasError={!!formState.errors.accessReason}
          hint={formState.errors.accessReason?.message}
          label={t('access-reason.label')}
          placeholder={t('access-reason.placeholder')}
          {...register('accessReason', {
            required: {
              value: true,
              message: t('access-reason.errors.required'),
            },
          })}
        />
      </Box>
    </form>
  );
};

export default BasicConfiguration;
