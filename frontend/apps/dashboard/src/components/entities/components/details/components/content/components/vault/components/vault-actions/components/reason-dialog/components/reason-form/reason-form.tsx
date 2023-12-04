import { useTranslation } from '@onefootprint/hooks';
import type { SelectOption } from '@onefootprint/ui';
import {
  Box,
  Divider,
  NativeSelect,
  TextArea,
  Typography,
} from '@onefootprint/ui';
import Hint from '@onefootprint/ui/src/components/internal/hint';
import Label from '@onefootprint/ui/src/components/label';
import React, { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

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
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const hasError = !!errors.reason;

  const handleBeforeSubmit = (formData: FormData) => {
    if (formData.customReason) {
      onSubmit(formData.customReason);
    } else if (formData.reason) {
      onSubmit(formData.reason.value);
    }
  };

  const options = [
    t('form.reason.options.customer-support-inquiry'),
    t('form.reason.options.customer-communication'),
    t('form.reason.options.customer-verification'),
    t('form.reason.options.auditor-review'),
    t('form.reason.options.transation-over-5k'),
    t('form.reason.options.change-of-direct-deposit'),
    t('form.reason.options.other'),
  ];

  return (
    <form id="decrypt-reason-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Typography variant="label-1" sx={{ marginBottom: 7 }}>
        {t('description')}
      </Typography>
      <Label htmlFor={useId()}>{t('form.reason.label')}</Label>
      <NativeSelect
        defaultValue={t('form.reason.options.customer-verification')}
        placeholder={t('form.reason.placeholder')}
        {...register('reason', {
          required: true,
          onChange: ({ target }) =>
            setShowCustomReason(
              target.value === t('form.reason.options.other'),
            ),
        })}
      >
        {options.map(option => (
          <option value={option}>{option}</option>
        ))}
      </NativeSelect>
      {hasError && (
        <Hint hasError={hasError}>{t('form.reason.errors.required')}</Hint>
      )}

      {showCustomReason && (
        <Box marginTop={4}>
          <TextArea
            autoFocus
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
