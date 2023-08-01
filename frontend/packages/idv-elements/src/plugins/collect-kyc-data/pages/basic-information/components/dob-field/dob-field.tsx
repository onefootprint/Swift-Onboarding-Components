import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import validateDob from '../../utils/validate-dob';

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

  return (
    <TextInput
      data-private
      disabled={disabled}
      hasError={!!errors.dob}
      hint={errors.dob ? t('error') : t('hint')}
      label={t('label')}
      mask={inputMasks.dob}
      placeholder={t('placeholder')}
      value={getValues('dob')}
      {...register('dob', {
        required: true,
        validate: validateDob,
      })}
    />
  );
};

export default DobField;
