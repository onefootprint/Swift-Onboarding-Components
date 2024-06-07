import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Box, media } from '@onefootprint/ui';
import React, { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import MobileHeader from '../../app-header/components/mobile-header';
import MenuLinks from './components/menu-links';

type MobileNavProps = {
  navigation?: PageNavigation;
};

const MobileNav = ({ navigation }: MobileNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateNavMenu] = useAutoAnimate<HTMLDivElement>();
  useLockedBody(isExpanded);

  const handleToggleNav = () => {
    setIsExpanded(prevState => !prevState);
  };

  const handleNavItemClick = () => {
    setIsExpanded(false);
  };

  return (
    <MobileNavContainer>
      <MobileHeader onClick={handleToggleNav} isExpanded={isExpanded} />
      <Box ref={animateNavMenu}>
        {isExpanded && navigation && (
          <NavMenu>
            <MenuLinks navigation={navigation} onNavItemClick={handleNavItemClick} />
          </NavMenu>
        )}
      </Box>
    </MobileNavContainer>
  );
};

const MobileNavContainer = styled.div`
  ${media.greaterThan('md')`
    display: none;
  `}
`;

const NavMenu = styled.nav`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    height: calc(100vh - var(--header-height));
    overflow: auto;
  `};
`;

export default MobileNav;
