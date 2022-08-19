import { useTranslation } from 'hooks';
import IcoDatabase16 from 'icons/ico/ico-database-16';
import IcoShield16 from 'icons/ico/ico-shield-16';
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
    { href: '/pii/getting-started', Icon: IcoDatabase16, text: t('nav.pii') },
  ];

  return (
    <Header>
      <DesktopNav navItems={navItems} />
      <MobileNav navItems={navItems} articles={articles} />
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
