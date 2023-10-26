import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type SSN4Props = {
  disabled?: boolean;
};

const SSN4 = ({ disabled }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.ssn.last-four');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <TextInput
      autoFocus
      data-private
      hasError={!!errors.ssn4}
      disabled={disabled}
      hint={errors.ssn4 && t('form.error')}
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
