import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import {
  IcoClose24,
  IcoMenu24,
  ThemedLogoFpDefault,
} from '@onefootprint/icons';
import { createFontStyles, media, useMediaQuery } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LinkButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import type { NavEntry } from '../../types';
import { isNavLink, isNavMenu } from '../../types';
import MobileNavLink from './components/mobile-nav-link';
import MobileNavMenu from './components/mobile-nav-menu';

type MobileNavProps = {
  onOpen: () => void;
  onClose: () => void;
  entries: NavEntry[];
  $isOnDarkSection?: boolean;
};

const { Root: NavigationMenuRoot, List: NavigationMenuList } = NavigationMenu;

const MobileNav = ({
  onOpen,
  onClose,
  entries,
  $isOnDarkSection,
}: MobileNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });
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

  return (
    <AnimatePresence>
      {isOpen ? (
        <Menu>
          <Header>
            <Logo href="/" onClick={handleLinkClick}>
              <ThemedLogoFpDefault color="primary" />
            </Logo>
            <NavTriggerButton
              aria-label={t('nav-toggle.open')}
              onClick={handleToggle}
              type="button"
            >
              <IcoClose24 />
            </NavTriggerButton>
          </Header>
          <Content
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <NavigationMenuRoot>
              <LinkList>
                {entries.map(entry => {
                  if (isNavLink(entry)) {
                    return <MobileNavLink key={entry.text} link={entry} />;
                  }
                  if (isNavMenu(entry)) {
                    return <MobileNavMenu menu={entry} key={entry.text} />;
                  }
                  return null;
                })}
              </LinkList>
            </NavigationMenuRoot>
            <CtaContainer>
              <LoginLink href={`${DASHBOARD_BASE_URL}/authentication/sign-in`}>
                {t('login')}
              </LoginLink>
              <LinkButton href={`${DASHBOARD_BASE_URL}/authentication/sign-up`}>
                {t('sign-up')}
              </LinkButton>
            </CtaContainer>
          </Content>
        </Menu>
      ) : (
        <Container>
          <Logo href="/" onClick={handleLinkClick}>
            <ThemedLogoFpDefault
              color={$isOnDarkSection ? 'quinary' : 'primary'}
            />
          </Logo>
          <NavTriggerButton
            aria-label={t('nav-toggle.close')}
            onClick={handleToggle}
            type="button"
          >
            <IcoMenu24 color={$isOnDarkSection ? 'quinary' : 'primary'} />
          </NavTriggerButton>
        </Container>
      )}
    </AnimatePresence>
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

const LinkList = styled(NavigationMenuList)`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
`;

const Logo = styled(Link)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    margin-right: ${theme.spacing[4]};
  `}
`;

const Menu = styled.div`
  ${({ theme }) => css`
    align-items: initial;
    position: relative;
    width: 100%;
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

const Content = styled(motion.span)`
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
