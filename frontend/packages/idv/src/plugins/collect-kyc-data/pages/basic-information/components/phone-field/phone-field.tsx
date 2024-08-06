import { TextInput } from '@onefootprint/ui';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type EmailFieldProps = { disabled?: boolean };

const getErrorHint = (errors: FieldErrors<FieldValues>) => {
  if (!errors.phoneNumber) return undefined;

  const { message } = errors.phoneNumber;
  return typeof message === 'string' && message ? message : undefined;
};

const PhoneField = ({ disabled }: EmailFieldProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.basic-information',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <TextInput
      data-nid-target="phone-number"
      data-dd-privacy="mask"
      defaultValue={getValues('phoneNumber')}
      disabled={disabled}
      hasError={!!errors.phoneNumber}
      hint={getErrorHint(errors)}
      label={t('form.phone.label')}
      placeholder={t('form.phone.placeholder')}
      type="tel"
      {...register('phoneNumber', {
        required: {
          value: true,
          message: t('form.phone.error-required'),
        },
      })}
    />
  );
};

export default PhoneField;
