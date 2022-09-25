import { useHasScroll, useToggle, useTranslation } from '@onefootprint/hooks';
import {
  IcoBook24,
  IcoFootprint24,
  IcoMegaphone24,
  IcoUsers24,
  IcoWriting24,
} from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Banner, Container, media } from 'ui';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import { NavEntry } from './types';

type NavbarProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
};

const Navbar = ({ cta }: NavbarProps) => {
  const [isFloatingEnabled, enableFloating, disableFloating] = useToggle(true);
  const hasScroll = useHasScroll();
  const { t } = useTranslation('components.navbar');

  const entries: NavEntry[] = [
    { text: t('entries.compare.text'), href: t('entries.compare.href') },
    { text: t('entries.pricing.text'), href: t('entries.pricing.href') },
    { text: t('entries.docs.text'), href: t('entries.docs.href') },
    {
      text: t('entries.company.text'),
      items: [
        {
          text: t('entries.company.links.about.text'),
          href: t('entries.company.links.about.href'),
          subtext: t('entries.company.links.about.subtext'),
          iconComponent: IcoFootprint24,
        },
        {
          text: t('entries.company.links.join-us.text'),
          href: t('entries.company.links.join-us.href'),
          subtext: t('entries.company.links.join-us.subtext'),
          iconComponent: IcoUsers24,
        },
      ],
    },
    { text: t('entries.faq.text'), href: t('entries.faq.href') },
    {
      text: t('entries.writing.text'),
      items: [
        {
          text: t('entries.writing.links.blog.text'),
          href: t('entries.writing.links.blog.href'),
          subtext: t('entries.writing.links.blog.subtext'),
          iconComponent: IcoWriting24,
        },
        {
          text: t('entries.writing.links.investor-updates.text'),
          href: t('entries.writing.links.investor-updates.href'),
          subtext: t('entries.writing.links.investor-updates.subtext'),
          iconComponent: IcoMegaphone24,
        },
        {
          text: t('entries.writing.links.library.text'),
          href: t('entries.writing.links.library.href'),
          subtext: t('entries.writing.links.library.subtext'),
          iconComponent: IcoBook24,
        },
      ],
    },
    { text: t('entries.media.text'), href: t('entries.media.href') },
  ];

  return (
    <Header isFloating={hasScroll && isFloatingEnabled}>
      <BannerContainer>
        <Banner variant="announcement">
          {t('banner.text')}{' '}
          <a
            href="https://techcrunch.com/2022/08/03/footprint-wants-to-change-how-companies-collect-store-and-share-personal-data/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('banner.link-label')}
          </a>
        </Banner>
      </BannerContainer>
      <Container>
        <Inner>
          <MobileNav
            onOpen={disableFloating}
            onClose={enableFloating}
            cta={{
              text: cta.text,
              onClick: cta.onClick,
            }}
            entries={entries}
          />
          <DesktopNav
            cta={{
              text: cta.text,
              onClick: cta.onClick,
            }}
            entries={entries}
          />
        </Inner>
      </Container>
    </Header>
  );
};

const BannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `}
`;

const Header = styled.header<{ isFloating: boolean }>`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: background 200ms ease 0s;
  ${({ theme }) => css`
    z-index: ${theme.zIndex.overlay};
  `}
  ${({ theme, isFloating }) =>
    isFloating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(255, 255, 255, 0.75);
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.primary};
    `}
`;

const Inner = styled.div`
  position: relative;
  ${({ theme }) => css`
    padding: ${theme.spacing[6]}px 0 ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]}px;
    `}
  `}
`;

export default Navbar;
