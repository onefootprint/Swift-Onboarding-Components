import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoClose24, IcoMenu24, ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Container, Overlay, Stack, createFontStyles, media, useMediaQuery } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LinkButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import _ from 'lodash';
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

const MobileNav = ({ entries, $isOnDarkSection }: MobileNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });

  const [isOpen, setIsOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoClick = () => {
    setIsOpen(false);
  };

  useLockedBody(isOpen);

  const menuVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.1, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.1, ease: 'easeOut' },
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
      <OuterContainer $isOpen={isOpen}>
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
        <AnimatePresence>
          {isOpen && (
            <>
              <NavigationMenu.Root asChild>
                <MenuContainer
                  ref={menuContainerRef}
                  variants={menuVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  flex={1}
                >
                  <LinkList>
                    {entries.map(entry => {
                      if (isNavLink(entry)) {
                        return <MobileNavLink key={_.uniqueId()} link={entry} />;
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
        </AnimatePresence>
      </OuterContainer>
      <Overlay isVisible={isOpen} />
    </>
  );
};

const OuterContainer = styled(Box)<{ $isOpen: boolean }>`
  ${({ theme, $isOpen }) => css`
    position: fixed;
    top: ${theme.spacing[3]};
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: calc(100vw - 2 * ${theme.spacing[3]});
    border-radius: ${theme.borderRadius.lg};
    overflow: hidden;
    z-index: ${theme.zIndex.dialog};
    background: rgba(${theme.backgroundColor.primary}, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: height 0.2s ease-out;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${
      $isOpen &&
      css`
        height: calc(100vh - 2 * ${theme.spacing[3]});
        background: ${theme.backgroundColor.primary};
      `
    }

    ${media.greaterThan('lg')`
      display: none;
    `}
  `}
`;

const MenuContainer = styled(motion(Box))`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    overflow-y: auto;
    flex: 1;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex: 1;
`;

const Main = styled(Container)`
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  min-height: var(--mobile-header-height);
  width: 100%;
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
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.color.primary};
    text-decoration: none;
  `}
`;

export default MobileNav;
