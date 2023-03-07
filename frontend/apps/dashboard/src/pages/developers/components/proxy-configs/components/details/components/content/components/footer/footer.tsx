import { useTranslation } from '@onefootprint/hooks';
import { Box, LinkButton } from '@onefootprint/ui';
import React from 'react';

const Footer = () => {
  const { t } = useTranslation('pages.proxy-configs.details.footer');

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <LinkButton size="compact">{t('edit-name')}</LinkButton>
      <LinkButton size="compact">{t('disable')}</LinkButton>
      <LinkButton size="compact" variant="destructive">
        {t('remove')}
      </LinkButton>
    </Box>
  );
};

export default Footer;
