import { Box, Container, createFontStyles, media } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
// import { useRouter } from 'next/router';
// import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import MessageBanner from 'src/components/layout/message-banner';
import MarketingLink from 'src/components/marketing-link';
import styled, { css } from 'styled-components';
import type { NavEntry } from '../../types';
import { isNavLink, isNavMenu } from '../../types';
import DesktopNavLink from './components/desktop-nav-link';
import DesktopNavMenu from './components/desktop-nav-menu';
import LogoCopyAssets from './components/logo-copy-assets';

// const ARTICLE_URL = '';

type DesktopNavProps = {
  entries: NavEntry[];
};

const DesktopNav = ({ entries }: DesktopNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar' });
  // const router = useRouter();
  // const isArticlePage = router.pathname.includes(ARTICLE_URL);
  // const [isBannerVisible, setIsBannerVisible] = useState<boolean>(!isArticlePage);

  return (
    <NavigationMenu.Root asChild>
      <NavContainer>
        {/* <MessageBanner
          showBanner={isBannerVisible}
          onClose={() => {
            setIsBannerVisible(false);
          }}
          articleUrl={ARTICLE_URL}
          text={t('message-banner.text')}
          cta={t('message-banner.cta')}
        /> */}
        <StyledContainer>
          <LogoCopyAssets />
          <MainNav>
            {entries.map(entry => {
              if (isNavLink(entry)) {
                return <DesktopNavLink link={entry} key={entry.text} />;
              }
              if (isNavMenu(entry)) {
                return <DesktopNavMenu menu={entry} key={entry.text} />;
              }
              return null;
            })}
          </MainNav>
          <SecondaryNav>
            <MarketingLink app="dashboard" href="authentication/sign-in" asChild>
              <Login>{t('login')}</Login>
            </MarketingLink>
            <MarketingLink app="dashboard" href="authentication/sign-up" asChild>
              <Signup>{t('sign-up')}</Signup>
            </MarketingLink>
          </SecondaryNav>
        </StyledContainer>
      </NavContainer>
    </NavigationMenu.Root>
  );
};

const NavContainer = styled(Box)`
  ${({ theme }) => css`
    display: none; 

    ${media.greaterThan('lg')`
      display: flex;
      position: fixed;
      flex-direction: column;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: ${theme.zIndex.sticky};
      background-color: ${theme.backgroundColor.primary};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      width: 100%;
    `}
  `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
      display: flex;
      flex-direction: row; 
      align-items: center;
      gap: ${theme.spacing[7]};
      justify-content: space-between;
      height: var(--desktop-header-height);
    };
  `}
`;

const MainNav = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    display: flex;
    position: relative;
    gap: ${theme.spacing[3]};
    justify-content: flex-start;
    width: 100%;
    height: 100%;
  `}
`;

const SecondaryNav = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 180px;
    justify-content: flex-end;
  `}
`;

const Login = styled.a`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};

    &:hover {
      opacity: 0.7;
    }
  `}
`;

const Signup = styled.a`
  ${({ theme }) => {
    const { button } = theme.components;

    return css`
      ${createFontStyles('label-3')};
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s ease-in-out;
      padding: ${theme.spacing[3]} ${theme.spacing[4]};
      background-color: ${button.variant.primary.bg};
      color: ${button.variant.primary.color};
      transition: ${button.transition};
      border-radius: ${button.borderRadius};

      &:hover:enabled {
        background-color: ${button.variant.primary.hover.bg};
        border-color: ${button.variant.primary.hover.borderColor};
        color: ${button.variant.primary.hover.color};
        box-shadow: ${button.variant.primary.hover.boxShadow};
      }
  `;
  }}
`;

export default DesktopNav;
