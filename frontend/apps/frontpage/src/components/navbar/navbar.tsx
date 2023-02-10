import { useHasScroll, useToggle, useTranslation } from '@onefootprint/hooks';
import {
  IcoBook24,
  IcoFootprint24,
  IcoMegaphone24,
  IcoUsers24,
  IcoWriting24,
} from '@onefootprint/icons';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import { NavEntry } from './types';

const Navbar = () => {
  const { t } = useTranslation('components.navbar');
  const [isFloatingEnabled, enableFloating, disableFloating] = useToggle(true);
  const hasScroll = useHasScroll();

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
      <Container>
        <Inner>
          <MobileNav
            onOpen={disableFloating}
            onClose={enableFloating}
            entries={entries}
          />
          <DesktopNav entries={entries} />
        </Inner>
      </Container>
    </Header>
  );
};

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
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[6]} 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]} 0;
    `}
  `}
`;

export default Navbar;
