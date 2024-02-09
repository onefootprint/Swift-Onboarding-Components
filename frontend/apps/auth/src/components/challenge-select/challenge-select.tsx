import { IcoEmail16, IcoFaceid16, IcoSmartphone16 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import type { ComponentProps, FormEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUserMachine } from '@/src/state';
import { isBiometricOrPasskey, isSmsOrPhone } from '@/src/utils';

import Component from './component';

type ChallengeSelectProps = Pick<
  ComponentProps<typeof Component>,
  'children' | 'Header'
>;

const getEmailEntry = (title: string) => ({
  IconComponent: IcoEmail16,
  title,
  value: ChallengeKind.email,
});

const getPhoneEntry = (title: string) => ({
  IconComponent: IcoSmartphone16,
  title,
  value: ChallengeKind.sms,
});

const getPhonePasskeyEntry = (title: string) => ({
  IconComponent: IcoFaceid16,
  title,
  value: ChallengeKind.biometric,
});

const ChallengeSelect = ({ children, Header }: ChallengeSelectProps) => {
  const { t } = useTranslation('common');
  const [state, send] = useUserMachine();
  const { kindToChallenge, userFound } = state.context;
  const availableOptions = userFound?.user?.availableChallengeKinds || [];
  const phoneTitle = `${t('send-code-to')} ${
    userFound?.user?.scrubbedPhone || ''
  }`;
  const emailTitle = `${t('send-code-to')} ${
    userFound?.user?.scrubbedEmail || ''
  }`;

  const handleOnChange = (str: string) =>
    send({ type: 'setChallengeKind', payload: str as ChallengeKind });

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!kindToChallenge) return;
    send({ type: 'goToChallenge', payload: kindToChallenge });
  };

  return (
    <Component
      Header={Header}
      isCtaDisabled={availableOptions.length === 0 || !kindToChallenge}
      isLoading={false}
      methodOptions={availableOptions.map(kind => {
        if (isBiometricOrPasskey(kind)) {
          return getPhonePasskeyEntry(t('passkey'));
        }
        return isSmsOrPhone(kind)
          ? getPhoneEntry(phoneTitle)
          : getEmailEntry(emailTitle);
      })}
      methodSelected={kindToChallenge || ''}
      onMethodChange={handleOnChange}
      onSubmit={handleSubmit}
      texts={{
        cta: t('continue'),
        headerSubtitle: t('log-in-to-modify-details'),
        headerTitle: t('verify-identity'),
      }}
    >
      {children}
    </Component>
  );
};

export default ChallengeSelect;
