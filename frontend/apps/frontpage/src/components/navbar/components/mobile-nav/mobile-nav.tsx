import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24, IcoMenu24 } from '@onefootprint/icons';
import { createFontStyles, media, useMediaQuery } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import LinkButton from 'src/components/link-button';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import { isNavLink, isNavMenu, NavEntry } from '../../types';
import LogoLink from '../logo-link';
import MobileNavLink from './components/mobile-nav-link';
import MobileNavMenu from './components/mobile-nav-menu';

type MobileNavProps = {
  onOpen: () => void;
  onClose: () => void;
  entries: NavEntry[];
};

const MobileNav = ({ onOpen, onClose, entries }: MobileNavProps) => {
  const { t } = useTranslation('components.navbar');
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
        <NavTriggerButton
          aria-label={t('nav-toggle.open')}
          onClick={handleToggle}
          type="button"
        >
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
          <LoginLink href={`${DASHBOARD_BASE_URL}/login`}>
            {t('login')}
          </LoginLink>
          <LinkButton href={`${DASHBOARD_BASE_URL}/sign-up`}>
            {t('sign-up')}
          </LinkButton>
        </CtaContainer>
      </Content>
    </Menu>
  ) : (
    <Container>
      <LogoLink onClick={handleLinkClick} />
      <NavTriggerButton
        aria-label={t('nav-toggle.close')}
        onClick={handleToggle}
        type="button"
      >
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
    margin-bottom: ${theme.spacing[5]};
    padding: ${theme.spacing[6]} ${theme.spacing[5]};
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
    display: flex;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]};

    > a {
      flex: 1;
    }
  `}
`;

const LoginLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-1')};
    align-items: center;
    color: ${theme.color.primary};
    display: flex;
    justify-content: center;
    text-decoration: none;
  `}
`;

export default MobileNav;
