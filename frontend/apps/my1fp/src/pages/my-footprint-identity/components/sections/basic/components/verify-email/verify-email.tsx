import { useTranslation } from 'hooks';
import React from 'react';
import { Box, LinkButton, LoadingIndicator, useToast } from 'ui';

import useVerificationEmail from './hooks/use-verification-email';

// TODO: https://linear.app/footprint/issue/FP-499/verify-email
// Make real HTTP REQUEST
// Mock request
// Test error scenario
const VerifyEmail = () => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.basic.email.verify',
  );
  const toast = useToast();
  const verificationEmailMutation = useVerificationEmail();

  const handleVerifyClick = () => {
    verificationEmailMutation.mutate(
      { authToken: 'fix-me' },
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
