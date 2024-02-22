import { Stack, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const FooterLinks = () => {
  const { t } = useTranslation('common', { keyPrefix: 'home.legal-documents' });

  return (
    <Container direction="row" gap={5}>
      <Link
        href="https://www.onefootprint.com/privacy-policy"
        target="_blank"
        rel="noreferrer"
      >
        <Typography variant="body-2" color="tertiary">
          {t('privacy-policy.title')}
        </Typography>
      </Link>
      <Link
        href="https://www.onefootprint.com/terms-of-service"
        target="_blank"
        rel="noreferrer"
      >
        <Typography variant="body-2" color="tertiary">
          {t('terms-of-service.title')}
        </Typography>
      </Link>
    </Container>
  );
};

const Container = styled(Stack)`
  a {
    text-decoration: none;
  }
`;

export default FooterLinks;
