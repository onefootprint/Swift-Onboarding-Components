import { useInputMask, useTranslation } from '@onefootprint/hooks';
import { IcoShield24 } from '@onefootprint/icons';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import InfoBox from '../../../../../../components/info-box';

type SSN9Props = {
  hideDisclaimer?: boolean;
  disabled?: boolean;
};

const SSN9 = ({ hideDisclaimer, disabled }: SSN9Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('pages.ssn.full');
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <TextInput
        autoFocus
        data-private
        hasError={!!errors.ssn9}
        disabled={disabled}
        hint={errors.ssn9 && t('form.error')}
        label={t('form.label')}
        mask={inputMasks.ssn}
        placeholder={t('form.placeholder')}
        type="tel"
        value={getValues('ssn9')}
        {...register('ssn9', {
          required: true,
          // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
          // Numbers with 666 or 900–999 in the first digit group are not allowed.
          // Also validates length & formatting.
          pattern: /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/,
        })}
      />
      {!hideDisclaimer && (
        <InfoBox
          items={[
            {
              title: t('disclaimer.security.title'),
              description: t('disclaimer.security.description'),
              Icon: IcoShield24,
            },
          ]}
          variant="default"
        />
      )}
    </>
  );
};

export default SSN9;
