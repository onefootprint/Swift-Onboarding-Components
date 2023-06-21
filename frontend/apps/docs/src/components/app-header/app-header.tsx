import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import type { PageNavigation } from 'src/types/page';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';

type AppHeaderProps = {
  navigation?: PageNavigation;
};

const AppHeader = ({ navigation }: AppHeaderProps) => {
  const { t } = useTranslation('components.header');

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
      <DesktopNav links={desktopLinks} />
      <MobileNav links={mobileLinks} navigation={navigation} />
    </Header>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background: ${theme.backgroundColor.primary};
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${theme.zIndex.overlay};
  `}
`;

export default AppHeader;
