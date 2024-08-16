import { isSsn4 } from '@onefootprint/core';
import { useInputMask } from '@onefootprint/hooks';
import { TextInput, Toggle } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormValues } from '../../ssn.types';

type SSN4Props = {
  disabled?: boolean;
  isOptional?: boolean;
  isSkipped: boolean;
  onSkipChange: () => void;
};

const SSN4 = ({ disabled, isOptional, isSkipped, onSkipChange }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn' });
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext<FormValues>();

  useEffect(() => {
    if (isSkipped) {
      setValue('ssn4', '', { shouldValidate: true });
    }
  }, [isSkipped, setValue]);

  return (
    <>
      <TextInput
        autoFocus
        data-dd-privacy="mask"
        data-nid-target="ssn4"
        disabled={disabled}
        hasError={!!errors.ssn4}
        hint={errors.ssn4?.message}
        label={t('ssn-4.label')}
        mask={inputMasks.lastFourSsn}
        placeholder={t('ssn-4.placeholder')}
        type="tel"
        value={getValues('ssn4')}
        {...register('ssn4', {
          validate: value => {
            if (!value) return t('ssn-4.errors.required');
            if (!isSsn4(value)) return t('ssn-4.errors.invalid');
            return true;
          },
        })}
      />
      {isOptional && <Toggle checked={isSkipped} label={t('skip-label')} onChange={onSkipChange} />}
    </>
  );
};

export default SSN4;
