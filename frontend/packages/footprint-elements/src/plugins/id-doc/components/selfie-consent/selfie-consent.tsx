import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Button, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

import { HeaderTitle } from '../../../../components';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useConsent from './hooks/use-consent';

type SelfieConsentProps = {
  open: boolean;
  onClose: (isConsented: boolean) => void;
};

const SelfieConsent = ({ open, onClose }: SelfieConsentProps) => {
  const { t } = useTranslation('components.selfie-consent');
  const [state] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useRequestErrorToast();

  const handleClose = () => {
    onClose(false);
  };

  const handleConsent = () => {
    if (!authToken || consentMutation.isLoading) {
      return;
    }

    const consentLanguageText = [
      t('title'),
      t('subtitle'),
      t('cta'),
      t('footer'),
    ].join(' ');
    consentMutation.mutate(
      { consentLanguageText, authToken },
      {
        onSuccess: () => {
          onClose(true);
        },
        onError: requestErrorToast,
      },
    );
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
      />
      <Button
        onClick={handleConsent}
        fullWidth
        sx={{ marginBottom: 5 }}
        loading={consentMutation.isLoading}
      >
        {t('cta')}
      </Button>
      <Typography
        variant="body-4"
        color="secondary"
        sx={{ textAlign: 'center' }}
      >
        <Trans
          i18nKey="components.selfie-consent.footer"
          components={{
            a: (
              <Link
                href="https://www.onefootprint.com/privacy-policy"
                rel="noopener noreferrer"
                target="_blank"
              />
            ),
          }}
        />
      </Typography>
    </BottomSheet>
  );
};

export default SelfieConsent;
