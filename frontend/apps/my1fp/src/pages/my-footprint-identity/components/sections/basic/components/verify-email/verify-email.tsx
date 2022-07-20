import { useTranslation } from 'hooks';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import { Box, LinkButton, LoadingIndicator, useToast } from 'ui';

import useVerificationEmail from './hooks/use-verification-email';

const VerifyEmail = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.basic.email.verify',
  );
  const toast = useToast();
  const { session } = useSessionUser();
  const verificationEmailMutation = useVerificationEmail();
  if (!session) {
    return null;
  }
  const {
    data: { email },
    authToken,
  } = session;

  const handleVerifyClick = () => {
    verificationEmailMutation.mutate(
      { email, authToken },
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
      {verificationEmailMutation.isLoading ? (
        <LoadingIndicator aria-label={t('loading')} />
      ) : (
        <LinkButton size="compact" onClick={handleVerifyClick}>
          {t('cta')}
        </LinkButton>
      )}
    </Box>
  );
};

export default VerifyEmail;
