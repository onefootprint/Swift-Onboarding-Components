import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Button, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans } from 'react-i18next';

import { HeaderTitle } from '../../../../components';

type SelfieConsentProps = {
  open: boolean;
  onClose: (isConsented?: boolean) => void;
};

const SelfieConsent = ({ open, onClose }: SelfieConsentProps) => {
  const { t } = useTranslation('components.selfie-consent');

  const handleClose = () => {
    onClose();
  };
  const handleConsent = () => {
    onClose(true);
  };

  return (
    <BottomSheet open={open} onClose={handleClose}>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
      />
      <Button onClick={handleConsent} fullWidth sx={{ marginBottom: 5 }}>
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
