import { useInputMask } from '@onefootprint/hooks';
import { IcoShield24 } from '@onefootprint/icons';
import { TextInput, Toggle } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import InfoBox from '../../../../../../components/info-box';

type SSN9Props = {
  hideDisclaimer?: boolean;
  disabled?: boolean;
  isOptional?: boolean;
  onSkipChange: () => void;
  isSkipped: boolean;
};

const SSN9 = ({
  hideDisclaimer,
  disabled,
  isOptional,
  onSkipChange,
  isSkipped,
}: SSN9Props) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn.full' });
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext();

  const getHint = () => {
    if (!errors.ssn9) {
      return undefined;
    }
    const { message } = errors.ssn9;
    if (message && typeof message === 'string') {
      return message;
    }
    return t('form.error');
  };

  useEffect(() => {
    if (isSkipped) {
      setValue('ssn9', '', { shouldValidate: true });
    }
  }, [isSkipped, setValue]);

  return (
    <>
      <TextInput
        autoFocus
        data-nid-target="ssn9"
        data-private
        data-dd-privacy="mask"
        disabled={disabled}
        hasError={!!errors.ssn9}
        hint={getHint()}
        label={t('form.label')}
        mask={inputMasks.ssn}
        placeholder={t('form.placeholder')}
        type="tel"
        value={getValues('ssn9')}
        {...register('ssn9', {
          required: !isSkipped,
          // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
          // Numbers with 666 or 900–999 in the first digit group are not allowed.
          // Also validates length & formatting.
          pattern: /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/,
        })}
      />
      {isOptional && (
        <Toggle
          checked={isSkipped}
          label={t('skip-label')}
          onChange={onSkipChange}
        />
      )}
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
