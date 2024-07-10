import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoClose24, IcoMenu24, ThemedLogoFpCompact } from '@onefootprint/icons';
import { Container, Stack, createFontStyles, media, useMediaQuery } from '@onefootprint/ui';
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
  isOpen: boolean;
  $isOnDarkSection?: boolean;
};

const MobileNav = ({ onOpen, onClose, entries, isOpen, $isOnDarkSection }: MobileNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });
  const breakpoint = useMediaQuery({ minWidth: 'lg', maxWidth: 'xl' });
  useLockedBody(isOpen);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (breakpoint && isOpen) {
      close();
    }
  }, [breakpoint, isOpen, close]);

  const handleToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  const handleLogoClick = () => {
    close();
  };

  const menuVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  const iconVariant = {
    initial: { rotate: 0 },
    animate: {
      rotate: isOpen ? 90 : 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      rotate: isOpen ? -90 : 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  return (
    <>
      <AnimatePresence>
        <OuterContainer>
          <Main>
            <Logo href="/" onClick={handleLogoClick}>
              <ThemedLogoFpCompact color={$isOnDarkSection ? 'quinary' : 'primary'} />
            </Logo>
            <NavTriggerButton
              aria-label={t(isOpen ? 'nav-toggle.close' : 'nav-toggle.open')}
              onClick={handleToggle}
              type="button"
            >
              <motion.div variants={iconVariant} initial="initial" animate="animate" exit="exit">
                {isOpen ? <IcoClose24 /> : <IcoMenu24 color={$isOnDarkSection ? 'quinary' : 'primary'} />}
              </motion.div>
            </NavTriggerButton>
          </Main>
          {isOpen && (
            <>
              <NavigationMenu.Root asChild>
                <MenuContainer initial="initial" animate="animate" exit="exit" variants={menuVariants} flex={1}>
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
                  <CtaContainer>
                    <LoginLink href={`${DASHBOARD_BASE_URL}/authentication/sign-in`}>{t('login')}</LoginLink>
                    <LinkButton href={`${DASHBOARD_BASE_URL}/authentication/sign-up`}>{t('sign-up')}</LinkButton>
                  </CtaContainer>
                </MenuContainer>
              </NavigationMenu.Root>
            </>
          )}
        </OuterContainer>
      </AnimatePresence>
    </>
  );
};

const MenuContainer = styled(motion(Stack))`
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

const OuterContainer = styled(motion(Container))`
    flex-direction: column;
    position: relative;
    flex: 1;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Main = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--mobile-header-height);

  ${media.greaterThan('lg')`
    display: none;
  `}
`;

const Logo = styled(Link)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    margin-right: ${theme.spacing[4]};
  `}
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
  
    & > a {
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
