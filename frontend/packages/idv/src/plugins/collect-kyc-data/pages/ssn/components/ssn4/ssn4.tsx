import { useInputMask } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type SSN4Props = {
  disabled?: boolean;
};

const SSN4 = ({ disabled }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn.last-four' });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  const getHint = () => {
    if (!errors.ssn4) {
      return undefined;
    }
    const { message } = errors.ssn4;
    if (message && typeof message === 'string') {
      return message;
    }
    return t('form.error');
  };

  return (
    <TextInput
      autoFocus
      data-nid-target="ssn4"
      data-private
      data-dd-privacy="mask"
      disabled={disabled}
      hasError={!!errors.ssn4}
      hint={getHint()}
      label={t('form.label')}
      mask={inputMasks.lastFourSsn}
      placeholder={t('form.placeholder')}
      type="tel"
      value={getValues('ssn4')}
      {...register('ssn4', {
        required: true,
        // 0000 is not allowed, has to be 4 digits long
        pattern: /^((?!(0000))\d{4})$/,
      })}
    />
  );
};

export default SSN4;
