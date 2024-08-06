import { AuthMethodKind } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import { getLogger } from '../../../../utils';
import type { UpdateVerifyBaseProps } from './update-verify';
import UpdateVerify from './update-verify';

type UpdateVerifyEmailProps = UpdateVerifyBaseProps & {
  authToken: string;
  email: string;
};

const { logWarn, logError } = getLogger({ location: 'update-verify-email' });

const UpdateVerifyEmail = ({
  Header,
  actionKind,
  identifyVariant,
  onBack,
  onChallengeVerificationSuccess,
  authToken,
  email,
}: UpdateVerifyEmailProps) => {
  const { t } = useTranslation('identify');
  const subtitle = email ? (
    <span data-dd-privacy="mask">{t('email-challenge.prompt-with-email', { email })}</span>
  ) : (
    t('email-challenge.prompt-without-email')
  );

  return (
    <UpdateVerify
      challengePayload={{
        authToken,
        kind: AuthMethodKind.email,
        email,
      }}
      Header={Header}
      actionKind={actionKind}
      identifyVariant={identifyVariant}
      onBack={onBack}
      onChallengeVerificationSuccess={onChallengeVerificationSuccess}
      headerTitle={t('email-challenge.verify-title')}
      headerSubtitle={subtitle}
      logError={logError}
      logWarn={logWarn}
    />
  );
};

export default UpdateVerifyEmail;
