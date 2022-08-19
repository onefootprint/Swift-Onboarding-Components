import { useTranslation } from 'hooks';
import Logo from 'icons/ico/logo-fpdocs-default';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Tab } from 'ui';

import type { NavItem } from '../../app-header.types';

type DesktopNavProps = {
  navItems: NavItem[];
};

const DesktopNav = ({ navItems }: DesktopNavProps) => {
  const router = useRouter();
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <Link href="/">
          <a href="/" aria-label={t('nav.home')}>
            <Logo />
          </a>
        </Link>
        <Tab.List>
          {navItems.map(({ href, Icon, text }) => (
            <Link href={href} key={text} passHref>
              <Tab.Item
                iconComponent={Icon}
                selected={router.asPath.startsWith(href)}
              >
                {text}
              </Tab.Item>
            </Link>
          ))}
        </Tab.List>
      </Nav>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: none;
    height: var(--header-height);
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[7] + theme.spacing[2]}px;

    nav > a {
      display: flex;
    }

    ${media.greaterThan('sm')`
      display: flex;
    `}
  `};
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]}px;
  `};
`;

export default DesktopNav;
