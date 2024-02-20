import { Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmailForm from '../../../email-form';
import { ActionKind } from '../../queries/use-user-challenge';
import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import UpdateVerifyEmail from './update-verify-email';

type UpdateEmailProps = {
  Header: (props: HeaderProps) => JSX.Element;
  authToken: string;
  actionKind: ActionKind;
  identifyVariant: IdentifyVariant;
  onSuccess: (newEmail: string) => void;
};

enum Screen {
  collect,
  verify,
}

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

  const actionKindToHeader: Record<ActionKind, string> = {
    [ActionKind.addPrimary]: t('email-step.add-primary-title'),
    [ActionKind.replace]: t('email-step.replace-title'),
  };
  const title = actionKindToHeader[actionKind];

  if (screen === Screen.collect || !email) {
    return (
      <Stack direction="column" gap={7}>
        <Header title={title} subtitle={t('email-step.update-subtitle')} />
        <EmailForm
          defaultEmail={email}
          isLoading={false}
          onSubmit={({ email: newEmail }) => {
            setEmail(newEmail);
            setScreen(Screen.verify);
          }}
          texts={{
            cta: t('continue'),
            emailIsRequired: t('email-is-required'),
            emailLabel: t('email'),
            emailPlaceholder: t('email-placeholder'),
          }}
        />
      </Stack>
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
