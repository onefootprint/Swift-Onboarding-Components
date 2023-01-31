import { useTranslation } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
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
    position: relative;
    bottom: 0;
    left: 0;
    padding: ${theme.spacing[4]};
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[7]};
    margin-top: ${theme.spacing[4]};

    a {
      text-decoration: none;
    }
  `}

  ${media.greaterThan('md')`
    position: absolute;
    bottom: 0;
    left: 0;
    justify-content: flex-end;
  `}
`;

export default Footer;
