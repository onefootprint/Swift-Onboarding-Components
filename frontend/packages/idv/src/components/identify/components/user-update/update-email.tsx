import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import { UpdateAuthMethodActionKind } from '../../types';
import EmailPageStructure from '../email-page-structure';
import { ScreenState, isCollectScreen } from './helpers';
import UpdateVerifyEmail from './update-verify-email';

type UpdateEmailProps = {
  actionKind: UpdateAuthMethodActionKind;
  authToken: string;
  Header: (props: HeaderProps) => JSX.Element;
  identifyVariant: IdentifyVariant;
  initialEmail?: string;
  onSuccess: (newEmail: string) => void;
};

const getHeaderTitle = (t: TFunction<'identify'>, kind: UpdateAuthMethodActionKind): string =>
  kind === UpdateAuthMethodActionKind.replace ? t('email-step.replace-title') : t('email-step.add-primary-title');

const UpdateEmail = ({ Header, actionKind, authToken, identifyVariant, initialEmail, onSuccess }: UpdateEmailProps) => {
  const { t } = useTranslation('identify');
  const [screen, setScreen] = useState<ScreenState>(initialEmail ? ScreenState.verify : ScreenState.collect);
  const [email, setEmail] = useState<string>(initialEmail || '');

  return isCollectScreen(screen) || !email ? (
    <EmailPageStructure
      Header={Header}
      onSubmit={newEmail => {
        setEmail(newEmail);
        setScreen(ScreenState.verify);
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
  ) : (
    <UpdateVerifyEmail
      Header={Header}
      email={email}
      authToken={authToken}
      actionKind={actionKind}
      identifyVariant={identifyVariant}
      onChallengeVerificationSuccess={() => onSuccess(email)}
      onBack={() => setScreen(ScreenState.collect)}
    />
  );
};

export default UpdateEmail;
