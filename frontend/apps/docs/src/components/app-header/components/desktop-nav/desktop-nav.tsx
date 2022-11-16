import { useTranslation } from '@onefootprint/hooks';
import { LogoFpdocsDefault } from '@onefootprint/icons';
import { LinkButton, media, Tab, Tabs } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import type { LinkItem, NavItem } from '../../app-header.types';

type DesktopNavProps = {
  navItems: NavItem[];
  links: LinkItem[];
};

const DesktopNav = ({ navItems, links }: DesktopNavProps) => {
  const router = useRouter();
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <InternalNavContainer>
          <LogoLink href="/" aria-label={t('nav.home')}>
            <LogoFpdocsDefault />
          </LogoLink>
          <Tabs variant="pill">
            {navItems.map(({ baseHref, href, Icon, text }) => (
              <Tab
                as={Link}
                href={href}
                selected={router.asPath.startsWith(baseHref)}
              >
                <Icon />
                {text}
              </Tab>
            ))}
          </Tabs>
        </InternalNavContainer>
        <>
          {links.map(({ href, Icon, text }) => (
            <LinkButton
              href={href}
              iconComponent={Icon}
              size="compact"
              target="_blank"
              key={text}
            >
              {text}
            </LinkButton>
          ))}
        </>
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
    gap: ${theme.spacing[8]};
  `};
`;

const LogoLink = styled(Link)`
  display: flex;
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: none;
    height: var(--header-height);
    justify-content: space-between;
    padding: ${theme.spacing[4]} calc(${theme.spacing[7]} + ${theme.spacing[2]});

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
    gap: ${theme.spacing[8]};
  `};
`;

export default DesktopNav;
