import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import validateDob from '../../utils/validate-dob';

const DobField = () => {
  const { t } = useTranslation('pages.basic-information');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const inputMasks = useInputMask('en-US');

  return (
    <TextInput
      hasError={!!errors[UserDataAttribute.dob]}
      hint={errors[UserDataAttribute.dob] ? t('form.dob.error') : undefined}
      label={t('form.dob.label')}
      mask={inputMasks.dob}
      placeholder={t('form.dob.placeholder')}
      value={getValues(UserDataAttribute.dob)}
      {...register(UserDataAttribute.dob, {
        required: true,
        validate: validateDob,
      })}
    />
  );
};

export default DobField;
