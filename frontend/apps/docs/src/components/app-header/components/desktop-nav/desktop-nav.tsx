import { useTranslation } from '@onefootprint/hooks';
import { LogoFpdocsDefault } from '@onefootprint/icons';
import { LinkButton, media } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import type { LinkItem } from '../../app-header.types';

type DesktopNavProps = {
  links: LinkItem[];
};

const DesktopNav = ({ links }: DesktopNavProps) => {
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <LogoLink href="/" aria-label={t('nav.home')}>
          <LogoFpdocsDefault />
        </LogoLink>
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

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: none;
    height: var(--header-height);
    justify-content: space-between;
    padding: ${theme.spacing[4]} calc(${theme.spacing[7]} + ${theme.spacing[2]});
    width: 100%;

    ${media.greaterThan('sm')`
      display: flex;
    `}
  `};
`;

const LogoLink = styled(Link)`
  display: flex;
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
