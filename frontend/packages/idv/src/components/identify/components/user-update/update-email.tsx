import type { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import { UpdateAuthMethodActionKind } from '../../types';
import EmailPageStructure from '../email-page-structure';
import UpdateVerifyEmail from './update-verify-email';

type UpdateEmailProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  actionKind: UpdateAuthMethodActionKind;
  identifyVariant: IdentifyVariant;
  onSuccess: (newEmail: string) => void;
};

enum Screen {
  collect = 'collect',
  verify = 'verify',
}

const getHeaderTitle = (
  t: TFunction<'identify'>,
  kind: UpdateAuthMethodActionKind,
): string =>
  kind === UpdateAuthMethodActionKind.replace
    ? t('email-step.replace-title')
    : t('email-step.add-primary-title');

const UpdateEmail = ({
  Header,
  authToken,
  onSuccess,
  actionKind,
  identifyVariant,
}: UpdateEmailProps) => {
  const { t } = useTranslation('identify');
  const [screen, setScreen] = useState<Screen>(Screen.collect);
  const [email, setEmail] = useState<string>('');

  if (screen === Screen.collect || !email) {
    return (
      <EmailPageStructure
        Header={Header}
        onSubmit={newEmail => {
          setEmail(newEmail);
          setScreen(Screen.verify);
        }}
        defaultEmail={email}
        isLoading={false}
        texts={{
          headerTitle: getHeaderTitle(t, actionKind),
          headerSubtitle: t('email-step.update-subtitle'),
          cta: t('continue'),
          emailIsRequired: t('email-is-required'),
          emailLabel: t('email'),
          emailPlaceholder: t('email-placeholder'),
        }}
      />
    );
  }

  return (
    <UpdateVerifyEmail
      Header={Header}
      email={email}
      authToken={authToken}
      actionKind={actionKind}
      identifyVariant={identifyVariant}
      onChallengeVerificationSuccess={() => onSuccess(email)}
      onBack={() => {
        setScreen(Screen.collect);
      }}
    />
  );
};

export default UpdateEmail;
