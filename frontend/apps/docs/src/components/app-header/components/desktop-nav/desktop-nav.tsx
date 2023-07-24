import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, LinkButton, media } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

import type { LinkItem } from '../../app-header.types';
import LogoCopyAssets from './components/logo-copy-assets';

type DesktopNavProps = {
  links: LinkItem[];
};

const DesktopNav = ({ links }: DesktopNavProps) => {
  const { t } = useTranslation('components.header');

  return (
    <Container>
      <Nav>
        <MainLinks>
          <LogoCopyAssets />
          <Line />
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

const MainLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[4]};
    position: relative;
    flex: 1;
    height: 100%;
  `};
`;

const Line = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 1px;
    background-color: ${theme.borderColor.tertiary};
    max-height: 20px;
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
