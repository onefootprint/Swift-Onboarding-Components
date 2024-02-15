import { AuthMethodKind } from '@onefootprint/types/src/data';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLogger } from '../../../../utils';
import type { UpdateVerifyGenericProps } from './update-verify';
import UpdateVerify from './update-verify';

type UpdateVerifyEmailProps = UpdateVerifyGenericProps & {
  authToken: string;
  email: string;
};

const { logWarn, logError } = getLogger('update-verify-email');

const UpdateVerifyEmail = ({
  Header,
  actionKind,
  onBack,
  onChallengeVerificationSuccess,
  authToken,
  email,
}: UpdateVerifyEmailProps) => {
  const { t } = useTranslation('identify');
  const subtitle = email
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
      actionKind={actionKind}
      onBack={onBack}
      onChallengeVerificationSuccess={onChallengeVerificationSuccess}
      headerTitle={t('email-challenge.verify-title')}
      subtitle={subtitle}
      logError={logError}
      logWarn={logWarn}
    />
  );
};

export default UpdateVerifyEmail;
