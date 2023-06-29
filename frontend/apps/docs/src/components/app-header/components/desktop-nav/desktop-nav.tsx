import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { LogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, LinkButton, media } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

import type { LinkItem } from '../../app-header.types';

type DesktopNavProps = {
  links: LinkItem[];
};

const DesktopNav = ({ links }: DesktopNavProps) => {
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <MainLinks>
          <LogoLink href={FRONTPAGE_BASE_URL} aria-label={t('nav.home')}>
            <LogoFpCompact />
          </LogoLink>
          <Divider />
          <DocumentationLink href="/">
            {t('nav.documentation')}
          </DocumentationLink>
        </MainLinks>

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

const DocumentationLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    text-decoration: none;
    transition: opacity 0.2s ease-in-out;

    @media (hover: hover) {
      &:hover {
        opacity: 0.8;
      }
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('sm')`
      display: flex;
      height: var(--header-height);
      padding: ${theme.spacing[4]} calc(${theme.spacing[7]} + ${theme.spacing[2]});
      width: 100%;
    `}
  `};
`;

const LogoLink = styled(Link)`
  display: flex;
  transition: opacity 0.2s ease-in-out;

  @media (hover: hover) {
    &:hover {
      opacity: 0.8;
    }
  }
`;

const Divider = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 1px;
    background-color: ${theme.borderColor.tertiary};
    max-height: 20px;
  `}
`;

const MainLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    position: relative;
    height: 100%;
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
