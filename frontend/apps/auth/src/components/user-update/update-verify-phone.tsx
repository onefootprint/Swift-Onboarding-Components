import { getLogger } from '@onefootprint/idv';
import { AuthMethodKind } from '@onefootprint/types/src/data';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '@/src/types';

import UpdateVerify from './update-verify';

type UpdateVerifyPhoneProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  phoneNumber: string;
  onSuccess: (newPhone: string) => void;
};

const { logWarn, logError } = getLogger('update-verify-phone');

const UpdateVerifyPhone = ({
  Header,
  authToken,
  phoneNumber,
  onSuccess,
}: UpdateVerifyPhoneProps) => {
  const { t } = useTranslation('common');
  const headerTitle = phoneNumber
    ? t('sms-step.prompt-with-phone', { scrubbedPhoneNumber: phoneNumber })
    : t('sms-step.prompt-without-phone');

  return (
    <UpdateVerify
      challengePayload={{
        authToken,
        kind: AuthMethodKind.phone,
        phoneNumber: phoneNumber.replace(/[()\s-]/g, ''),
      }}
      Header={Header}
      headerTitle={headerTitle}
      logError={logError}
      logWarn={logWarn}
      onChallengeVerificationSuccess={() => onSuccess(phoneNumber)}
    />
  );
};

export default UpdateVerifyPhone;
