import { UserChallengeActionKind } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IdentifyVariant } from '../../state/types';
import type { HeaderProps } from '../../types';
import EmailPageStructure from '../email-page-structure';
import { ScreenState, isCollectScreen } from './helpers';
import UpdateVerifyEmail from './update-verify-email';

type UpdateEmailProps = {
  actionKind: UserChallengeActionKind;
  authToken: string;
  Header: (props: HeaderProps) => JSX.Element;
  identifyVariant: IdentifyVariant;
  initialEmail?: string;
  onSuccess: (newEmail: string) => void;
};

const UpdateEmail = ({ Header, actionKind, authToken, identifyVariant, initialEmail, onSuccess }: UpdateEmailProps) => {
  const { t } = useTranslation('identify');
  const [screen, setScreen] = useState<ScreenState>(initialEmail ? ScreenState.verify : ScreenState.collect);
  const [email, setEmail] = useState<string>(initialEmail || '');

  const getHeaderTitle = (kind: UserChallengeActionKind): string => {
    return kind === UserChallengeActionKind.replace ? t('email-step.replace-title') : t('email-step.add-primary-title');
  };

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
        header: {
          title: getHeaderTitle(actionKind),
          subtitle: t('email-step.update-subtitle'),
        },
        email: {
          invalid: t('email.errors.invalid'),
          label: t('email.label'),
          placeholder: t('email.placeholder'),
          required: t('email.errors.required'),
        },
        cta: t('continue'),
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
