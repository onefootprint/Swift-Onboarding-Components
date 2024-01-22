import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { SecuredByFootprint } from '@onefootprint/idv';
import styled, { css } from '@onefootprint/styled';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { media, Typography } from '@onefootprint/ui';
import i18n from 'i18next';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import WhatsThisPopover from '../whats-this-popover';
import type { Language } from './components/language-select';
import LanguageSelect from './components/language-select';
import {
  languageBaseList,
  LanguageCodes,
} from './components/language-select/language-select-types';

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

  const [activeLanguage, setActiveLanguage] = useState<Language>(
    languageBaseList[0],
  );

  const handleChangeLanguage = () => {
    const changeTo =
      i18n.language === LanguageCodes.EN ? LanguageCodes.ES : LanguageCodes.EN;
    // const allLanguages = i18n.languages; // TODO: uncomment to get all languages
    i18n.changeLanguage(changeTo);
    document.documentElement.setAttribute('lang', changeTo);
    setActiveLanguage(languageBaseList.find(lang => lang.code === changeTo)!);
  };

  return (
    <Container>
      <SecuredByFootprint />
      <LinksContainer>
        <LanguageSelect
          onLanguageChange={handleChangeLanguage}
          activeLanguage={activeLanguage}
        />
        {links.map(({ href, label }) =>
          href ? (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer">
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

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

export default Footer;
