import { useHasScroll, useToggle } from '@onefootprint/hooks';
import {
  IcoBank24,
  IcoBuilding24,
  IcoCar24,
  IcoDollar24,
  IcoKey24,
  IcoMegaphone24,
  IcoShield24,
  IcoSquareFrame24,
  IcoStore24,
  IcoUser24,
  IcoWriting24,
} from '@onefootprint/icons';
import { Container, media } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import MessageBanner from '../layout/message-banner';
import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import type { NavEntry } from './types';

const ARTICLE_URL = '/blog/footprint-13m-series-a-led-by-qed';

const Navbar = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });
  const [isFloatingEnabled, enableFloating, disableFloating] = useToggle(true);
  const hasScroll = useHasScroll();
  const router = useRouter();
  const isArticlePage = router.pathname.includes(ARTICLE_URL);

  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(!isArticlePage);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (isBannerVisible) {
      url.searchParams.set('banner', 'true');
    } else {
      url.searchParams.delete('banner');
    }
    router.push(url.toString(), undefined, { shallow: true });
  }, [isBannerVisible]);

  const handleCloseBanner = () => setIsBannerVisible(false);
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
          text: t('entries.platform.links.kyb.text'),
          subtext: t('entries.platform.links.kyb.subtext'),
          href: t('entries.platform.links.kyb.href'),
          iconComponent: IcoStore24,
        },
        {
          text: t('entries.platform.links.vaulting.text'),
          subtext: t('entries.platform.links.vaulting.subtext'),
          href: t('entries.platform.links.vaulting.href'),
          iconComponent: IcoKey24,
        },
        {
          text: t('entries.platform.links.auth.text'),
          subtext: t('entries.platform.links.auth.subtext'),
          href: t('entries.platform.links.auth.href'),
          iconComponent: IcoShield24,
        },
        {
          text: t('entries.platform.links.doc-scan.text'),
          subtext: t('entries.platform.links.doc-scan.subtext'),
          href: t('entries.platform.links.doc-scan.href'),
          iconComponent: IcoSquareFrame24,
        },
      ],
    },
    {
      text: t('entries.industries.text'),
      items: [
        {
          text: t('entries.industries.links.auto.text'),
          subtext: t('entries.industries.links.auto.subtext'),
          href: t('entries.industries.links.auto.href'),
          iconComponent: IcoCar24,
        },
        {
          text: t('entries.industries.links.financial-institutions.text'),
          subtext: t('entries.industries.links.financial-institutions.subtext'),
          href: t('entries.industries.links.financial-institutions.href'),
          iconComponent: IcoBank24,
        },
        {
          text: t('entries.industries.links.fintech.text'),
          subtext: t('entries.industries.links.fintech.subtext'),
          href: t('entries.industries.links.fintech.href'),
          iconComponent: IcoDollar24,
        },
        {
          text: t('entries.industries.links.real-estate.text'),
          subtext: t('entries.industries.links.real-estate.subtext'),
          href: t('entries.industries.links.real-estate.href'),
          iconComponent: IcoBuilding24,
        },
      ],
    },
    { text: t('entries.customers.text'), href: t('entries.customers.href') },
    { text: t('entries.pricing.text'), href: t('entries.pricing.href') },
    { text: t('entries.docs.text'), href: t('entries.docs.href') },
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
      ],
    },
    {
      text: t('entries.changelog.text'),
      href: t('entries.changelog.href'),
    },
  ];

  return (
    <Header $isFloating={hasScroll && isFloatingEnabled}>
      <MessageBanner
        showBanner={isBannerVisible}
        onClose={handleCloseBanner}
        articleUrl={ARTICLE_URL}
        text="Footprint raised $13M Series A led by QED Investors"
      />
      <Container>
        <Inner id="navbar">
          <MobileNav onOpen={disableFloating} onClose={enableFloating} entries={entries} />
          <DesktopNav entries={entries} />
        </Inner>
      </Container>
    </Header>
  );
};

const Header = styled.header<{
  $isFloating: boolean;
}>`
  ${({ theme, $isFloating }) => css`
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    transition: background 200ms ease 0s;
    z-index: ${theme.zIndex.overlay};

    ${
      $isFloating &&
      css`
      -webkit-backdrop-filter: blur(15px) saturate(125%);
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(${theme.backgroundColor.primary}, 0.75);
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    `
    }
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    padding: ${theme.spacing[6]} 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[3]} 0;
    `}
  `}
`;

export default Navbar;
