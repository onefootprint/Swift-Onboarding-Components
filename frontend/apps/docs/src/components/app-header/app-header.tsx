import { useTranslation } from 'hooks';
import { IcoArrowUpRight16, IcoDatabase16, IcoShield16 } from 'icons';
import React from 'react';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';

type PageHeaderProps = {
  articles?: ProductArticle[];
};

const PageHeader = ({ articles }: PageHeaderProps) => {
  const { t } = useTranslation('components.header');
  const navItems = [
    {
      href: '/kyc-with-pii/getting-started',
      Icon: IcoShield16,
      text: t('nav.kyc-with-pii'),
    },
    {
      href: '/pii/getting-started',
      Icon: IcoDatabase16,
      text: t('nav.pii'),
    },
  ];

  const desktopLinks = [
    {
      href: 'https://onefootprint.stoplight.io/docs/footprint/36c0a7469ddb2-org',
      Icon: IcoArrowUpRight16,
      text: t('nav.docs.desktop'),
    },
  ];

  const mobileLinks = [
    {
      href: 'https://onefootprint.stoplight.io/docs/footprint/36c0a7469ddb2-org',
      Icon: IcoArrowUpRight16,
      text: t('nav.docs.mobile'),
    },
  ];

  return (
    <Header>
      <DesktopNav navItems={navItems} links={desktopLinks} />
      <MobileNav navItems={navItems} articles={articles} links={mobileLinks} />
    </Header>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default PageHeader;
