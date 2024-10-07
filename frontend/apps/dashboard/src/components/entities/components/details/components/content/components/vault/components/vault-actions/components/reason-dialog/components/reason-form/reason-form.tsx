import { Box, Divider, Form, Hint, Text, TextArea } from '@onefootprint/ui';
import { useState } from 'react';
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
  const defaultValue = options[2];

  return (
    <form id="decrypt-reason-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Text variant="label-1" marginBottom={7}>
        {t('description')}
      </Text>
      <Form.Field>
        <Form.Label>{t('form.reason.label')}</Form.Label>
        <Form.Select
          {...register('reason', {
            required: t('form.reason.errors.required'),
            onChange: ({ target }) => setShowCustomReason(target.value === t('form.reason.options.other')),
          })}
          defaultValue={defaultValue}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
        <Form.Errors>{errors.reason?.message}</Form.Errors>
      </Form.Field>
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
