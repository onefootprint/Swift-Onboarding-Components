import { ChallengeKind } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getLogger } from '@/src/utils';

import ChallengeVerifyInput from './challenge-verify-input';

type ChallengeVerifyPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logWarn, logError } = getLogger('challenge-verify-phone');

const ChallengeVerifyPhone = ({
  children,
  Header,
}: ChallengeVerifyPhoneProps) => {
  const [state, send] = useUserMachine();
  const { phoneChallenge } = state.context;
  const { t } = useTranslation('common');
  const scrubbedPhoneNumber = phoneChallenge?.scrubbedPhoneNumber;
  const headerTitle = scrubbedPhoneNumber
    ? t('sms-step.prompt-with-phone', { scrubbedPhoneNumber })
    : t('sms-step.prompt-without-phone');

  return (
    <ChallengeVerifyInput
      challenge={phoneChallenge}
      Header={Header}
      headerTitle={headerTitle}
      kind={ChallengeKind.sms}
      logError={logError}
      logWarn={logWarn}
      onLoginChallengeSuccess={payload =>
        send({ type: 'setPhoneChallenge', payload })
      }
    >
      {children}
    </ChallengeVerifyInput>
  );
};

export default ChallengeVerifyPhone;
