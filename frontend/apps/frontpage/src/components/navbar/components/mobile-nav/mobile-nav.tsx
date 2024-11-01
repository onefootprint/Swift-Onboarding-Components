import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoClose24, IcoMenu24, ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Container, createFontStyles, media } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LinkButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';
import { useLockedBody } from 'usehooks-ts';

import uniqueId from 'lodash/uniqueId';
import { LINTRK_CONVERSION_ID } from 'src/config/constants';
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

  const handleLoginClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
  };

  const handleSignUpClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
  };

  useLockedBody(isOpen);

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

  const menuVariants = {
    initial: { opacity: 0, y: -5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.1, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: 0,
      transition: { duration: 0.05, ease: 'easeOut' },
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
                      return <MobileNavLink key={uniqueId()} link={entry} />;
                    }
                    if (isNavMenu(entry)) {
                      return <MobileNavMenu menu={entry} key={entry.text} />;
                    }
                    return null;
                  })}
                </LinkList>
                <CtaContainer>
                  <LoginLink href={`${DASHBOARD_BASE_URL}/authentication/sign-in`} onClick={handleLoginClick}>
                    {t('login')}
                  </LoginLink>
                  <LinkButton href={`${DASHBOARD_BASE_URL}/authentication/sign-up`} onClick={handleSignUpClick}>
                    {t('sign-up')}
                  </LinkButton>
                </CtaContainer>
              </MenuContainer>
            </NavigationMenu.Root>
          )}
        </AnimatePresence>
      </OuterContainer>
    </>
  );
};

const OuterContainer = styled(Box)<{ $isOpen: boolean }>`
  ${({ theme, $isOpen }) => css`
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 100vw;
    overflow: hidden;
    z-index: ${theme.zIndex.dialog};
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: auto;

    ${
      $isOpen &&
      css`
        height: 100dvh;
        background: ${theme.backgroundColor.primary};
        border-bottom: none;
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
