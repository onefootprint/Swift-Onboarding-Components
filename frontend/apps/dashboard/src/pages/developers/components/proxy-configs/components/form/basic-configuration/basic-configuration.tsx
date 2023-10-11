import { useTranslation } from '@onefootprint/hooks';
import {
  Box,
  FormControl,
  FormLabel,
  NativeSelect,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { FormData, StepProps } from '@/proxy-configs/proxy-configs.types';

const BasicConfiguration = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation(
    'pages.proxy-configs.create.form.basic-configuration',
  );
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
      <Typography variant="label-2" sx={{ marginBottom: 5 }}>
        {t('title')}
      </Typography>
      <Box gap={7} sx={{ display: 'grid' }}>
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
            placeholder={t('method.placeholder')}
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
