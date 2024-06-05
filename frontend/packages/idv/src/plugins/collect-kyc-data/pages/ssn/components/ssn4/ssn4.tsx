import { useInputMask } from '@onefootprint/hooks';
import { TextInput, Toggle } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type SSN4Props = {
  disabled?: boolean;
  isOptional?: boolean;
  onSkipChange: () => void;
  isSkipped: boolean;
};

const SSN4 = ({ disabled, isOptional, isSkipped, onSkipChange }: SSN4Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn.last-four' });
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
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
          required: !isSkipped,
          // 0000 is not allowed, has to be 4 digits long
          pattern: /^((?!(0000))\d{4})$/,
        })}
      />
      {isOptional && (
        <Toggle
          checked={isSkipped}
          label={t('skip-label')}
          onChange={onSkipChange}
        />
      )}
    </>
  );
};

export default SSN4;
