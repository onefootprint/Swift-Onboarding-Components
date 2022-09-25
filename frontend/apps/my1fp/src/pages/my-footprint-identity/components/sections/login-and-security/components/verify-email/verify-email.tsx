import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { Box, LinkButton, LoadingIndicator, Typography, useToast } from 'ui';

import { UserIdentification } from '../../../../../../../hooks/use-session-user/use-session-user';
import useVerificationEmail from './hooks/use-verification-email';

type VerifyEmailProps = {
  email: UserIdentification;
};

const VerifyEmail = ({ email }: VerifyEmailProps) => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.login-and-security.email.verify',
  );
  const toast = useToast();
  const { session } = useSessionUser();
  const verificationEmailMutation = useVerificationEmail();
  if (!session) {
    return null;
  }

  if (verificationEmailMutation.isLoading) {
    return (
      <Box>
        <LoadingIndicator aria-label={t('loading')} />
      </Box>
    );
  }

  if (verificationEmailMutation.isSuccess) {
    return (
      <Box>
        <Typography variant="label-3" color="tertiary">
          {t('email-sent')}
        </Typography>
      </Box>
    );
  }

  const handleVerifyClick = () => {
    const { authToken } = session;
    verificationEmailMutation.mutate(
      { id: email.id, authToken },
      {
        onSuccess: () => {
          toast.show({
            title: t('success.title'),
            description: t('success.description'),
          });
        },
        onError: () => {
          toast.show({
            variant: 'error',
            title: t('error.title'),
            description: t('error.description'),
          });
        },
      },
    );
  };

  return (
    <Box>
      <LinkButton
        testID="verify-email"
        size="compact"
        onClick={handleVerifyClick}
      >
        {t('cta')}
      </LinkButton>
    </Box>
  );
};

export default VerifyEmail;
