import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { SecuredByFootprint } from '@onefootprint/idv';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';

import WhatsThisPopover from '../whats-this-popover';
import LanguageSelect from './components/language-select';

type Link = { label: string; href?: string; onClick?: () => void };

type FootprintFooterProps = {
  config?: PublicOnboardingConfig;
};

const Footer = ({ config }: FootprintFooterProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.layout.app-footer',
  });

  const links: Link[] = [
    {
      label: t('links.what-is-this'),
    },
    {
      label: t('links.privacy'),
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
    {
      label: t('links.terms'),
      href: 'https://onefootprint.com/terms-of-service',
    },
  ];

  return (
    <Container>
      <SecuredByFootprint />
      <LinksContainer>
        <LanguageSelect />
        {links.map(({ href, label }) =>
          href ? (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                <Typography variant="caption-1" color="secondary" as="span">
                  {label}
                </Typography>
              </a>
            </li>
          ) : (
            <WhatsThisPopover config={config} label={label} key={label} />
          ),
        )}
        <li>
          <Image
            src="/footer/soc-2-badge.png"
            height={32}
            width={32}
            alt="Soc2 badge"
          />
        </li>
      </LinksContainer>
    </Container>
  );
};

const Container = styled.footer`
  ${({ theme }) => css`
    display: none;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      display: flex;
      padding: 0 ${theme.spacing[11]};
    `}
  `};
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[7]};

    .footer-link {
      text-decoration: none;
      color: ${theme.color.secondary};

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          display: inline-block;
        }
      }
    }
  `}
`;

export default Footer;
