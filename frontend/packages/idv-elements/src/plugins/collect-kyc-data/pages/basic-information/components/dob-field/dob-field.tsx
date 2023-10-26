import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { useL10nContext } from '../../../../../../components/l10n-provider';
import validateDob, { DobValidationError } from './utils/validate-dob';

type DobFieldProps = { disabled?: boolean };

const DobField = ({ disabled }: DobFieldProps) => {
  const { t } = useTranslation('pages.basic-information.form.dob');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const l10n = useL10nContext();
  const inputMasks = useInputMask(l10n?.locale);

  const errorByValidationError: Record<DobValidationError, string> = {
    [DobValidationError.INVALID]: t('error.invalid'),
    [DobValidationError.FUTURE_DATE]: t('error.future-date'),
    [DobValidationError.TOO_YOUNG]: t('error.too-young'),
    [DobValidationError.TOO_OLD]: t('error.too-old'),
  };

  const getErrorMessage = () => {
    if (!errors.dob) {
      return undefined;
    }
    const { message } = errors.dob;
    if (message && typeof message === 'string') {
      return message;
    }
    const validationError = validateDob(getValues('dob'));
    return errorByValidationError[
      validationError ?? DobValidationError.INVALID
    ];
  };

  return (
    <TextInput
      data-private
      disabled={disabled}
      hasError={!!errors.dob}
      hint={getErrorMessage()}
      label={t('label')}
      inputMode="numeric"
      mask={inputMasks.dob}
      placeholder={inputMasks.dob.placeholder}
      value={getValues('dob')}
      {...register('dob', {
        required: true,
        validate: (value: string) => !validateDob(value),
      })}
    />
  );
};

export default DobField;
