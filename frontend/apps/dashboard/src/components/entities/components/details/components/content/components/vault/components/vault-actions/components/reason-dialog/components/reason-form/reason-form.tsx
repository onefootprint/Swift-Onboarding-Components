import { useTranslation } from '@onefootprint/hooks';
import type { SelectOption } from '@onefootprint/ui';
import { Box, Divider, Select, TextArea, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
  reason?: SelectOption;
  customReason?: string;
};

type ReasonFormProps = {
  onSubmit: (reason: string) => void;
};

const ReasonForm = ({ onSubmit }: ReasonFormProps) => {
  const [showCustomReason, setShowCustomReason] = useState(false);
  const { t } = useTranslation('pages.entity.decrypt.reason-dialog');
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleBeforeSubmit = (formData: FormData) => {
    if (formData.customReason) {
      onSubmit(formData.customReason);
    } else if (formData.reason) {
      onSubmit(formData.reason.value);
    }
  };

  return (
    <form id="decrypt-reason-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Typography variant="label-1" sx={{ marginBottom: 7 }}>
        {t('description')}
      </Typography>
      <Controller
        control={control}
        name="reason"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Select
            label={t('form.reason.label')}
            hasError={!!fieldState.error}
            hint={fieldState.error && t('form.reason.errors.required')}
            onBlur={field.onBlur}
            onChange={option => {
              setShowCustomReason(
                option.value === t('form.reason.options.other'),
              );
              field.onChange(option);
            }}
            options={[
              {
                value: t('form.reason.options.customer-support-inquiry'),
                label: t('form.reason.options.customer-support-inquiry'),
              },
              {
                value: t('form.reason.options.customer-communication'),
                label: t('form.reason.options.customer-communication'),
              },
              {
                value: t('form.reason.options.customer-verification'),
                label: t('form.reason.options.customer-verification'),
              },
              {
                value: t('form.reason.options.auditor-review'),
                label: t('form.reason.options.auditor-review'),
              },
              {
                value: t('form.reason.options.transation-over-5k'),
                label: t('form.reason.options.transation-over-5k'),
              },
              {
                value: t('form.reason.options.change-of-direct-deposit'),
                label: t('form.reason.options.change-of-direct-deposit'),
              },
              {
                value: t('form.reason.options.other'),
                label: t('form.reason.options.other'),
              },
            ]}
            placeholder={t('form.reason.placeholder')}
            value={field.value}
          />
        )}
      />
      {showCustomReason && (
        <Box marginTop={4}>
          <TextArea
            hasError={!!errors.customReason}
            hint={
              errors.customReason && t('form.custom-reason.errors.required')
            }
            placeholder={t('form.custom-reason.placeholder')}
            {...register('customReason', { required: true })}
          />
        </Box>
      )}
      <Box marginTop={7} marginBottom={7}>
        <Divider />
      </Box>
      <Typography variant="body-3" color="tertiary">
        {t('disclaimer')}
      </Typography>
    </form>
  );
};

export default ReasonForm;
