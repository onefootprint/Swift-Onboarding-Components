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
  onConsent: () => void;
  onClose: () => void;
};

const SelfieConsent = ({ open, onConsent, onClose }: SelfieConsentProps) => {
  const { t } = useTranslation('components.selfie-consent');
  const [state] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useRequestErrorToast();

  const handleClose = () => {
    onClose();
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
          onConsent();
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
        sx={{ marginBottom: 4 }}
      />
      <Typography
        variant="body-2"
        color="secondary"
        sx={{ textAlign: 'center', marginTop: 4 }}
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
      <Button
        onClick={handleConsent}
        fullWidth
        sx={{ marginTop: 8, marginBottom: 7 }}
        loading={consentMutation.isLoading}
      >
        {t('cta')}
      </Button>
    </BottomSheet>
  );
};

export default SelfieConsent;
