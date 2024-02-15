import { AuthMethodKind } from '@onefootprint/types/src/data';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLogger } from '../../../../utils';
import type { UpdateVerifyGenericProps } from './update-verify';
import UpdateVerify from './update-verify';

type UpdateVerifyPhoneProps = UpdateVerifyGenericProps & {
  authToken: string;
  phoneNumber: string;
};

const { logWarn, logError } = getLogger('update-verify-phone');

const UpdateVerifyPhone = ({
  Header,
  actionKind,
  onBack,
  onChallengeVerificationSuccess,
  authToken,
  phoneNumber,
}: UpdateVerifyPhoneProps) => {
  const { t } = useTranslation('identify');
  const subtitle = phoneNumber
    ? t('sms-challenge.prompt-with-phone', { scrubbedPhoneNumber: phoneNumber })
    : t('sms-challenge.prompt-without-phone');

  return (
    <UpdateVerify
      challengePayload={{
        authToken,
        kind: AuthMethodKind.phone,
        phoneNumber: phoneNumber.replace(/[()\s-]/g, ''),
      }}
      Header={Header}
      actionKind={actionKind}
      onBack={onBack}
      onChallengeVerificationSuccess={onChallengeVerificationSuccess}
      headerTitle={t('sms-challenge.verify-title')}
      subtitle={subtitle}
      logError={logError}
      logWarn={logWarn}
    />
  );
};

export default UpdateVerifyPhone;
