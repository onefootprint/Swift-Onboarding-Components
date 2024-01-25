import { ChallengeKind } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getLogger, isString } from '@/src/utils';

import UpdateVerify from './update-verify';

type UpdateVerifyEmailProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logWarn, logError } = getLogger('update-verify-email');

const UpdateVerifyEmail = ({ children, Header }: UpdateVerifyEmailProps) => {
  const { t } = useTranslation('common');
  const [state, send] = useUserMachine();
  const { email, emailReplaceChallenge, verifyToken } = state.context;
  const headerTitle = email
    ? t('email-challenge.prompt-with-email', { email })
    : t('email-challenge.prompt-without-email');

  if (!isString(email) || !isString(verifyToken))
    return (
      <Header
        title={t('notification.missing-args-title')}
        subtitle={t('notification.missing-args-description')}
      />
    );

  return (
    <UpdateVerify
      challenge={emailReplaceChallenge}
      challengePayload={{
        authToken: verifyToken,
        kind: 'email',
        email,
      }}
      Header={Header}
      headerTitle={headerTitle}
      logError={logError}
      logWarn={logWarn}
      onChallengeSuccess={payload =>
        send({ type: 'setEmailReplaceChallenge', payload })
      }
      onChallengeVerificationSuccess={() =>
        send({
          type: 'updateUserDashboard',
          payload: {
            kind: ChallengeKind.email,
            entry: { label: email, status: 'set' },
          },
        })
      }
    >
      {children}
    </UpdateVerify>
  );
};

export default UpdateVerifyEmail;
