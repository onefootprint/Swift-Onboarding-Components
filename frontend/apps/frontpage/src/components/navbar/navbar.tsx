import { primitives } from '@onefootprint/design-tokens';
import { useHasScroll, useToggle, useTranslation } from '@onefootprint/hooks';
import {
  IcoFileText24,
  IcoKey24,
  IcoMegaphone24,
  IcoStore24,
  IcoUser24,
  IcoWriting24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import type { NavEntry } from './types';

const Navbar = () => {
  const { t } = useTranslation('components.navbar');
  const [isFloatingEnabled, enableFloating, disableFloating] = useToggle(true);
  const [isOnDarkSection, setIsOnDarkSection] = useState(false);
  const hasScroll = useHasScroll();

  const entries: NavEntry[] = [
    {
      text: t('entries.platform.text'),
      items: [
        {
          text: t('entries.platform.links.kyc.text'),
          subtext: t('entries.platform.links.kyc.subtext'),
          href: t('entries.platform.links.kyc.href'),
          iconComponent: IcoUser24,
        },
        {
          text: t('entries.platform.links.vaulting.text'),
          subtext: t('entries.platform.links.vaulting.subtext'),
          href: t('entries.platform.links.vaulting.href'),
          iconComponent: IcoKey24,
        },
        {
          text: t('entries.platform.links.kyb.text'),
          subtext: t('entries.platform.links.kyb.subtext'),
          href: t('entries.platform.links.kyb.href'),
          iconComponent: IcoStore24,
        },
      ],
    },
    { text: t('entries.compare.text'), href: t('entries.compare.href') },
    { text: t('entries.pricing.text'), href: t('entries.pricing.href') },
    { text: t('entries.docs.text'), href: t('entries.docs.href') },
    {
      text: t('entries.company.text'),
      href: t('entries.company.links.about.href'),
    },
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
          iconComponent: IcoFileText24,
        },
      ],
    },
    { text: t('entries.media.text'), href: t('entries.media.href') },
    { text: t('entries.changelog.text'), href: t('entries.changelog.href') },
  ];

  const handleScroll = () => {
    const darkStart = document.getElementById('dark-start');
    const darkEnd = document.getElementById('dark-end');

    if (darkStart && darkEnd) {
      const rectStart = darkStart.getBoundingClientRect();
      const rectEnd = darkEnd.getBoundingClientRect();

      if (rectStart.top < 50 && rectEnd.top > 50) {
        setIsOnDarkSection(true);
      } else {
        setIsOnDarkSection(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Header
      isFloating={hasScroll && isFloatingEnabled}
      isOnDarkSection={isOnDarkSection}
    >
      <Container>
        <Inner id="navbar">
          <MobileNav
            onOpen={disableFloating}
            onClose={enableFloating}
            entries={entries}
            isOnDarkSection={isOnDarkSection}
          />
          <DesktopNav entries={entries} isOnDarkSection={isOnDarkSection} />
        </Inner>
      </Container>
    </Header>
  );
};

const Header = styled.header<{
  isFloating: boolean;
  isOnDarkSection?: boolean;
}>`
  ${({ theme, isFloating, isOnDarkSection }) => css`
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    transition: background 200ms ease 0s;
    z-index: ${theme.zIndex.overlay};

    ${isFloating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(
        ${isOnDarkSection ? primitives.Gray0 : theme.backgroundColor.primary}
          0.75
      );
      border-bottom: ${theme.borderWidth[1]} solid
        ${isOnDarkSection ? primitives.Gray700 : theme.borderColor.primary};
    `}
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[6]} 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[3]} 0;
    `}
  `}
`;

export default Navbar;
