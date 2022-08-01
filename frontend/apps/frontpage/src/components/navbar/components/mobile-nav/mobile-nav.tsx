import IcoClose24 from 'icons/ico/ico-close-24';
import IcoMenu24 from 'icons/ico/ico-menu-24';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { useLockBodyScroll } from 'react-use';
import styled, { css } from 'styled-components';
import { Button, createFontStyles, media, useMediaQuery } from 'ui';

import LogoLink from '../logo-link';

type MobileNavProps = {
  onOpen: () => void;
  onClose: () => void;
  cta: {
    text: string;
    onClick: () => void;
  };
  links: { text: string; href: string }[];
};

const MobileNav = ({ onOpen, onClose, cta, links }: MobileNavProps) => {
  const breakpoint = useMediaQuery({ minWidth: 'lg', maxWidth: 'xl' });
  const [isOpen, setOpen] = useState(false);
  useLockBodyScroll(isOpen);

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
        <LinksContainer>
          {links.map(link => (
            <Link href={link.href} key={link.text}>
              <a href={link.href} onClick={handleLinkClick}>
                {link.text}
              </a>
            </Link>
          ))}
        </LinksContainer>
        <CtaContainer>
          <Button onClick={cta.onClick} fullWidth>
            {cta.text}
          </Button>
        </CtaContainer>
      </Content>
    </Menu>
  ) : (
    <Container>
      <NavTriggerButton type="button" onClick={handleToggle}>
        <IcoMenu24 />
      </NavTriggerButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: end;

  ${media.greaterThan('lg')`
    display: none;
  `}
`;

const Menu = styled(Container)`
  ${({ theme }) => css`
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

const LinksContainer = styled.div`
  ${({ theme }) => css`
    a {
      ${createFontStyles('label-1')};
      color: ${theme.color.primary};
      display: block;
      padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      text-decoration: none;
    }
  `}
`;

const CtaContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]}px;
  `}
`;

export default MobileNav;
