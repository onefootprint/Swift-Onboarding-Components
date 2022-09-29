import { useTranslation } from '@onefootprint/hooks';
import { LogoFpdocsDefault } from '@onefootprint/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { LinkButton, media, Tab, Tabs } from 'ui';

import type { NavItem } from '../../app-header.types';

type DesktopNavProps = {
  navItems: NavItem[];
  links: NavItem[];
};

const DesktopNav = ({ navItems, links }: DesktopNavProps) => {
  const router = useRouter();
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <InternalNavContainer>
          <Link href="/">
            <a href="/" aria-label={t('nav.home')}>
              <LogoFpdocsDefault />
            </a>
          </Link>
          <Tabs variant="pill">
            {navItems.map(({ href, Icon, text }) => (
              <Link href={href} key={text} passHref>
                <Tab selected={router.asPath.startsWith(href)}>
                  <Icon />
                  {text}
                </Tab>
              </Link>
            ))}
          </Tabs>
        </InternalNavContainer>
        <div>
          {links.map(({ href, Icon, text }) => (
            <LinkButton
              href={href}
              iconComponent={Icon}
              size="compact"
              target="_blank"
            >
              {text}
            </LinkButton>
          ))}
        </div>
      </Nav>
    </Container>
  );
};

const InternalNavContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]}px;
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
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
    width: 100%;
    justify-content: space-between;
    align-items: center;
    display: flex;
    gap: ${theme.spacing[8]}px;
  `};
`;

export default DesktopNav;
