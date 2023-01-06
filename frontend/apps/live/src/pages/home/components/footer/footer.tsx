import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

const Footer = () => {
  const { t } = useTranslation('home.legal-documents');

  return (
    <FooterContainer>
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
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  ${({ theme }) => css`
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: ${theme.spacing[4]};
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing[4]};
    a {
      text-decoration: none;
    }
  `}
`;

export default Footer;
