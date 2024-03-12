import { useInputMask } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React from 'react';
import type {
  FieldErrors,
  FieldValues,
  UseFormGetValues,
} from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../../../components/l10n-provider';
import validateDob, { DobValidationError } from './utils/validate-dob';

type DobFieldProps = { disabled?: boolean };
type T = TFunction<'idv', 'kyc.pages.basic-information.form.dob'>;

const getErrorMessage = (
  t: T,
  getValues: UseFormGetValues<FieldValues>,
  errors: FieldErrors<FieldValues>,
) => {
  const errorByValidationError: Record<DobValidationError, string> = {
    [DobValidationError.INVALID]: t('error.invalid'),
    [DobValidationError.FUTURE_DATE]: t('error.future-date'),
    [DobValidationError.TOO_YOUNG]: t('error.too-young'),
    [DobValidationError.TOO_OLD]: t('error.too-old'),
  };
  if (!errors.dob) {
    return undefined;
  }
  const { message } = errors.dob;
  if (message && typeof message === 'string') {
    return message;
  }
  const validationError = validateDob(getValues('dob'));
  return errorByValidationError[validationError ?? DobValidationError.INVALID];
};

const DobField = ({ disabled }: DobFieldProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyc.pages.basic-information.form.dob',
  });
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const l10n = useL10nContext();
  const inputMasks = useInputMask(l10n?.locale);

  return (
    <TextInput
      data-private
      disabled={disabled}
      hasError={!!errors.dob}
      hint={getErrorMessage(t, getValues, errors)}
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
