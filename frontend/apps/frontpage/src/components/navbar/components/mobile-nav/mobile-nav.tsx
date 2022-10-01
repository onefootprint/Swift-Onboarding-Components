import { IcoClose24, IcoMenu24 } from '@onefootprint/icons';
import { Button, media, useMediaQuery } from '@onefootprint/ui';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import { isNavLink, isNavMenu, NavEntry } from '../../types';
import LogoLink from '../logo-link';
import MobileNavLink from './components/mobile-nav-link';
import MobileNavMenu from './components/mobile-nav-menu';

type MobileNavProps = {
  onOpen: () => void;
  onClose: () => void;
  cta: {
    text: string;
    onClick: () => void;
  };
  entries: NavEntry[];
};

const MobileNav = ({ onOpen, onClose, cta, entries }: MobileNavProps) => {
  const breakpoint = useMediaQuery({ minWidth: 'lg', maxWidth: 'xl' });
  const [isOpen, setOpen] = useState(false);
  useLockedBody(isOpen);

  const close = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (breakpoint && isOpen) {
      close();
    }
  }, [breakpoint, isOpen, close]);

  const handleToggle = () => {
    setOpen(currentOpen => {
      const nextOpen = !currentOpen;
      if (nextOpen) {
        onOpen();
      } else {
        onClose();
      }
      return nextOpen;
    });
  };

  const handleLinkClick = () => {
    close();
  };

  return isOpen ? (
    <Menu>
      <Header>
        <LogoLink onClick={handleLinkClick} />
        <NavTriggerButton type="button" onClick={handleToggle}>
          <IcoClose24 />
        </NavTriggerButton>
      </Header>
      <Content>
        <nav>
          {entries.map(entry => {
            if (isNavLink(entry)) {
              return (
                <MobileNavLink
                  key={entry.text}
                  link={entry}
                  onClick={handleLinkClick}
                />
              );
            }
            if (isNavMenu(entry)) {
              return (
                <MobileNavMenu
                  menu={entry}
                  key={entry.text}
                  onClickItem={handleLinkClick}
                />
              );
            }
            return null;
          })}
        </nav>
        <CtaContainer>
          <Button onClick={cta.onClick} fullWidth>
            {cta.text}
          </Button>
        </CtaContainer>
      </Content>
    </Menu>
  ) : (
    <Container>
      <LogoLink onClick={handleLinkClick} />
      <NavTriggerButton type="button" onClick={handleToggle}>
        <IcoMenu24 />
      </NavTriggerButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media.greaterThan('lg')`
    display: none;
  `}
`;

const Menu = styled(Container)`
  ${({ theme }) => css`
    align-items: initial;
    background: ${theme.backgroundColor.primary};
    bottom: 0;
    display: flex;
    flex-direction: column;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;

    ${media.greaterThan('lg')`
      display: none;
    `}
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]}px;
    padding: ${theme.spacing[6]}px ${theme.spacing[5]}px;
  `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
`;

const NavTriggerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  height: 36px;
  margin: 0;
  padding: 0;
  width: 36px;
`;

const CtaContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px;
  `}
`;

export default MobileNav;
