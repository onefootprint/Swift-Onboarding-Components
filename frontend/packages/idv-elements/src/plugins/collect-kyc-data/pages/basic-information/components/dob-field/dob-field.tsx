import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import validateDob, { DobValidationError } from './utils/validate-dob';

type DobFieldProps = {
  disabled?: boolean;
};

const DobField = ({ disabled }: DobFieldProps) => {
  const { t } = useTranslation('pages.basic-information.form.dob');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const inputMasks = useInputMask('en-US');

  const errorByValidationError: Record<DobValidationError, string> = {
    [DobValidationError.INVALID]: t('error.invalid'),
    [DobValidationError.FUTURE_DATE]: t('error.future-date'),
    [DobValidationError.TOO_YOUNG]: t('error.too-young'),
    [DobValidationError.TOO_OLD]: t('error.too-old'),
  };

  const getErrorMessage = () => {
    if (errors.dob) {
      const validationError = validateDob(getValues('dob'));
      return errorByValidationError[
        validationError ?? DobValidationError.INVALID
      ];
    }
    return undefined;
  };

  return (
    <TextInput
      data-private
      disabled={disabled}
      hasError={!!errors.dob}
      hint={getErrorMessage()}
      label={t('label')}
      mask={inputMasks.dob}
      placeholder={t('placeholder')}
      value={getValues('dob')}
      {...register('dob', {
        required: true,
        validate: (value: string) => !validateDob(value),
      })}
    />
  );
};

export default DobField;
