import { useInputMask } from '@onefootprint/hooks';
import type { Mask } from '@onefootprint/hooks/src/use-input-mask';
import { TextInput } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { FieldErrors, FieldValues, UseFormGetValues } from 'react-hook-form';
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
  masks: Mask,
) => {
  const errorByValidationError: Record<DobValidationError, string> = {
    [DobValidationError.INVALID]: t('error.invalid'),
    [DobValidationError.FUTURE_DATE]: t('error.future-date'),
    [DobValidationError.TOO_YOUNG]: t('error.too-young'),
    [DobValidationError.TOO_OLD]: t('error.too-old'),
    [DobValidationError.INCORRECT_FORMAT]: t('error.incorrect-format', {
      format: masks.dob.placeholder,
    }),
  };
  if (!errors.dob) {
    return undefined;
  }
  const { message } = errors.dob;
  if (message && typeof message === 'string') {
    return message;
  }
  const validationError = validateDob(getValues('dob'), masks);
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
      data-nid-target="dob"
      data-dd-privacy="mask"
      disabled={disabled}
      hasError={!!errors.dob}
      hint={getErrorMessage(t, getValues, errors, inputMasks)}
      label={t('label')}
      inputMode="numeric"
      mask={inputMasks.dob}
      placeholder={inputMasks.dob.placeholder}
      value={getValues('dob')}
      {...register('dob', {
        required: true,
        validate: (value: string) => !validateDob(value, inputMasks),
      })}
    />
  );
};

export default DobField;
