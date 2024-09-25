import { Box, Divider, Hint, NativeSelect, Text, TextArea } from '@onefootprint/ui';
import Label from '@onefootprint/ui/src/components/label';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type FormData = {
  reason?: string;
  customReason?: string;
};

type ReasonFormProps = {
  onSubmit: (reason: string) => void;
};

const ReasonForm = ({ onSubmit }: ReasonFormProps) => {
  const [showCustomReason, setShowCustomReason] = useState(false);
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'decrypt.reason-dialog',
  });
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
      onSubmit(formData.reason);
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
      <Text variant="label-1" marginBottom={7}>
        {t('description')}
      </Text>
      <Label htmlFor={useId()}>{t('form.reason.label')}</Label>
      <NativeSelect
        defaultValue={t('form.reason.options.customer-verification')}
        {...register('reason', {
          required: true,
          onChange: ({ target }) => setShowCustomReason(target.value === t('form.reason.options.other')),
        })}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </NativeSelect>
      {hasError && <Hint hasError={hasError}>{t('form.reason.errors.required')}</Hint>}

      {showCustomReason && (
        <Box marginTop={4}>
          <TextArea
            autoFocus
            hasError={!!errors.customReason}
            hint={errors.customReason && t('form.custom-reason.errors.required')}
            placeholder={t('form.custom-reason.placeholder')}
            {...register('customReason', { required: true })}
          />
        </Box>
      )}
      <Box marginTop={7} marginBottom={7}>
        <Divider />
      </Box>
      <Text variant="body-3" color="tertiary">
        {t('disclaimer')}
      </Text>
    </form>
  );
};

export default ReasonForm;
