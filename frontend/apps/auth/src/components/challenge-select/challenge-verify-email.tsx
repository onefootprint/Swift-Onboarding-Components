import { useTranslation } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';
import React from 'react';

import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getLogger } from '@/src/utils';

import ChallengeVerifyInput from './challenge-verify-input';

type ChallengeVerifyEmailProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logWarn, logError } = getLogger('challenge-verify-email');

const ChallengeVerifyEmail = ({
  children,
  Header,
}: ChallengeVerifyEmailProps) => {
  const [state, send] = useUserMachine();
  const { email, emailChallenge } = state.context;
  const { t } = useTranslation('auth');

  const headerTitle = email
    ? t('email-challenge.prompt-with-email', { email })
    : t('email-challenge.prompt-without-email');

  return (
    <ChallengeVerifyInput
      challenge={emailChallenge}
      Header={Header}
      headerTitle={headerTitle}
      kind={ChallengeKind.email}
      logError={logError}
      logWarn={logWarn}
      onLoginChallengeSuccess={payload =>
        send({ type: 'setEmailChallenge', payload })
      }
    >
      {children}
    </ChallengeVerifyInput>
  );
};

export default ChallengeVerifyEmail;
