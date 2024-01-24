import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getLogger, isString } from '@/src/utils';

import UpdateVerify from './update-verify';

type UpdateVerifyPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logWarn, logError } = getLogger('update-verify-phone');

const UpdateVerifyPhone = ({ children, Header }: UpdateVerifyPhoneProps) => {
  const { t } = useTranslation('auth');
  const [state, send] = useUserMachine();
  const { phoneNumber, phoneReplaceChallenge, verifyToken } = state.context;
  const headerTitle = phoneNumber
    ? t('sms-step.prompt-with-phone', { scrubbedPhoneNumber: phoneNumber })
    : t('sms-step.prompt-without-phone');

  if (!isString(phoneNumber) || !isString(verifyToken))
    return (
      <Header
        title={t('notification.missing-args-title')}
        subtitle={t('notification.missing-args-description')}
      />
    );

  return (
    <UpdateVerify
      challenge={phoneReplaceChallenge}
      challengePayload={{
        authToken: verifyToken,
        kind: 'phone',
        phoneNumber: phoneNumber.replace(/[()\s-]/g, ''),
      }}
      Header={Header}
      headerTitle={headerTitle}
      logError={logError}
      logWarn={logWarn}
      onChallengeSuccess={payload =>
        send({ type: 'setSmsReplaceChallenge', payload })
      }
      onChallengeVerificationSuccess={() =>
        send({
          type: 'updateUserDashboard',
          payload: {
            kind: 'phone',
            entry: { label: phoneNumber, status: 'set' },
          },
        })
      }
    >
      {children}
    </UpdateVerify>
  );
};

export default UpdateVerifyPhone;
