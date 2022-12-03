import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowUpRight16, IcoShield16 } from '@onefootprint/icons';
import React from 'react';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';

type AppHeaderProps = {
  navigation?: PageNavigation;
};

const AppHeader = ({ navigation }: AppHeaderProps) => {
  const { t } = useTranslation('components.header');
  const navItems = [
    {
      baseHref: '/kyc-with-pii',
      href: '/kyc-with-pii/getting-started',
      Icon: IcoShield16,
      text: t('nav.kyc-with-pii'),
    },
  ];

  const desktopLinks = [
    {
      href: 'https://api-docs.onefootprint.com/docs/footprint-public-docs',
      Icon: IcoArrowUpRight16,
      text: t('nav.docs.desktop'),
    },
  ];

  const mobileLinks = [
    {
      href: 'https://api-docs.onefootprint.com/docs/footprint-public-docs',
      Icon: IcoArrowUpRight16,
      text: t('nav.docs.mobile'),
    },
  ];

  return (
    <Header>
      <DesktopNav navItems={navItems} links={desktopLinks} />
      <MobileNav
        navItems={navItems}
        links={mobileLinks}
        navigation={navigation}
      />
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

export default AppHeader;
