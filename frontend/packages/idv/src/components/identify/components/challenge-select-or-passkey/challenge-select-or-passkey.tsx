import type { Icon } from '@onefootprint/icons';
import { IcoEmail16, IcoFaceid16, IcoSmartphone16 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import type { ComponentProps, FormEvent } from 'react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useGetHeaderText from '../../hooks/use-get-header-text';
import { useIdentifyMachine } from '../../state';
import { IdentifyVariant } from '../../state/types';
import Component from './component';
import useRunPasskey from './hooks/run-passkey';

type ChallengeSelectProps = Pick<
  ComponentProps<typeof Component>,
  'children' | 'Header'
>;

const challengeIcons: Record<ChallengeKind, Icon> = {
  [ChallengeKind.sms]: IcoSmartphone16,
  [ChallengeKind.email]: IcoEmail16,
  [ChallengeKind.biometric]: IcoFaceid16,
};

const challengePriority: Record<ChallengeKind, number> = {
  [ChallengeKind.biometric]: 0,
  [ChallengeKind.sms]: 1,
  [ChallengeKind.email]: 2,
};

// The passkey challenge doesn't require a PIN input, so we'll simply show it on this screen
const ChallengeSelectOrPasskey = ({
  children,
  Header,
}: ChallengeSelectProps) => {
  const [state, send] = useIdentifyMachine();
  const { identify, variant, device } = state.context;
  const { t } = useTranslation('identify', {
    keyPrefix: 'challenge-select-or-biometric',
  });
  const [selectedChallenge, setSelectedChallenge] = useState<
    ChallengeKind | undefined
  >(undefined);
  const runPasskey = useRunPasskey({
    onSuccess: ({ authToken }) => {
      send({ type: 'challengeSucceeded', payload: { authToken } });
    },
  });
  const headerTitle = useGetHeaderText();
  const headerSubtitle =
    variant !== IdentifyVariant.updateLoginMethods
      ? t('log-in-options')
      : t('log-in-to-modify-details');

  const sortedAvailableAuthMethods = (
    identify.user?.availableChallengeKinds || []
  )
    .sort((a, b) => challengePriority[a] - challengePriority[b])
    .filter(kind => {
      if (kind === ChallengeKind.biometric) {
        // Some special rules on whether we should show biometric challenges
        if (device.type === 'mobile') {
          return device.hasSupportForWebauthn;
        }
        return (
          device.hasSupportForWebauthn && !!identify.user?.hasSyncablePasskey
        );
      }
      return true;
    });
  useEffect(() => {
    if (sortedAvailableAuthMethods.length && !selectedChallenge) {
      setSelectedChallenge(sortedAvailableAuthMethods[0]);
    }
  }, [selectedChallenge, setSelectedChallenge, sortedAvailableAuthMethods]);

  const challengeTitles: Record<ChallengeKind, string> = {
    [ChallengeKind.sms]: identify.user?.scrubbedPhone
      ? `${t('send-code-to')} ${identify.user.scrubbedPhone}`
      : t('send-code-via-sms'),
    [ChallengeKind.email]: identify.user?.scrubbedEmail
      ? `${t('send-code-to')} ${identify.user.scrubbedEmail}`
      : t('send-code-via-email'),
    [ChallengeKind.biometric]: t('passkey'),
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selectedChallenge) {
      return;
    }
    if (selectedChallenge === ChallengeKind.biometric) {
      runPasskey.initiatePasskeyChallenge();
    } else {
      send({ type: 'goToChallenge', payload: selectedChallenge });
    }
  };

  const methodOptions = sortedAvailableAuthMethods.map(kind => {
    const title = challengeTitles[kind];
    const IconComponent = challengeIcons[kind];
    return {
      value: kind,
      title,
      IconComponent,
    };
  });

  return (
    <Component
      Header={Header}
      isCtaDisabled={!selectedChallenge}
      isLoading={runPasskey.isWaiting}
      methodOptions={methodOptions}
      methodSelected={selectedChallenge || ''}
      onMethodChange={value => setSelectedChallenge(value as ChallengeKind)}
      onSubmit={handleSubmit}
      texts={{
        cta: t('continue'),
        headerSubtitle,
        headerTitle,
      }}
    >
      {children}
    </Component>
  );
};

export default ChallengeSelectOrPasskey;
