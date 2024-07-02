import { useInputMask } from '@onefootprint/hooks';
import { TextInput, Toggle } from '@onefootprint/ui';
import { TFunction } from 'i18next';
import React, { useEffect } from 'react';
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type SSN4Props = {
  disabled?: boolean;
  isOptional?: boolean;
  isSkipped: boolean;
  onSkipChange: () => void;
};

const getErrorHint = (errors: FieldErrors<FieldValues>, t: TFunction<'idv', 'kyc.pages.ssn'>) => {
  if (!errors.ssn4) {
    return undefined;
  }
  const { message } = errors.ssn4;
  if (message && typeof message === 'string') {
    return message;
  }
  return t('ssn-invalid');
};

const SSN4 = ({ disabled, isOptional, isSkipped, onSkipChange }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn' });
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext();

  useEffect(() => {
    if (isSkipped) {
      setValue('ssn4', '', { shouldValidate: true });
    }
  }, [isSkipped, setValue]);

  return (
    <>
      <TextInput
        autoFocus
        data-nid-target="ssn4"
        data-dd-privacy="mask"
        disabled={disabled}
        hasError={!!errors.ssn4}
        hint={getErrorHint(errors, t)}
        label={t('ssn4-label')}
        mask={inputMasks.lastFourSsn}
        placeholder={t('ssn4-placeholder')}
        type="tel"
        value={getValues('ssn4')}
        {...register('ssn4', {
          required: !isSkipped,
          // 0000 is not allowed, has to be 4 digits long
          pattern: /^((?!(0000))\d{4})$/,
        })}
      />
      {isOptional && <Toggle checked={isSkipped} label={t('skip-label')} onChange={onSkipChange} />}
    </>
  );
};

export default SSN4;
