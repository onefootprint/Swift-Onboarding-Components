import { getLogger } from '@onefootprint/idv';
import { AuthMethodKind } from '@onefootprint/types/src/data';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '@/src/types';

import UpdateVerify from './update-verify';

type UpdateVerifyEmailProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  email: string;
  onSuccess: (newEmail: string) => void;
};

const { logWarn, logError } = getLogger('update-verify-email');

const UpdateVerifyEmail = ({
  Header,
  authToken,
  email,
  onSuccess,
}: UpdateVerifyEmailProps) => {
  const { t } = useTranslation('common');
  const headerTitle = email
    ? t('email-challenge.prompt-with-email', { email })
    : t('email-challenge.prompt-without-email');

  return (
    <UpdateVerify
      challengePayload={{
        authToken,
        kind: AuthMethodKind.email,
        email,
      }}
      Header={Header}
      headerTitle={headerTitle}
      logError={logError}
      logWarn={logWarn}
      onChallengeVerificationSuccess={() => onSuccess(email)}
    />
  );
};

export default UpdateVerifyEmail;
