import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles, media, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import SupportList from 'src/components/support-list';
import type { PageNavigation } from 'src/types/page';

type PageNavProps = {
  navigation: PageNavigation;
};

const PageNav = ({ navigation }: PageNavProps) => {
  const router = useRouter();

  return (
    <PageNavContainer>
      <NavContainer>
        {navigation.map(({ name, items }) => (
          <Box key={name}>
            <Header>
              <Typography variant="caption-1">{name}</Typography>
            </Header>
            <nav>
              {items.map(({ title, slug }) => (
                <StyledLink
                  key={slug}
                  href={slug}
                  data-selected={router.asPath === slug}
                >
                  {title}
                </StyledLink>
              ))}
            </nav>
          </Box>
        ))}
      </NavContainer>
      <BottomLinks>
        <SupportList />
      </BottomLinks>
    </PageNavContainer>
  );
};

const BottomLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const PageNavContainer = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('sm')`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      height: calc(100vh - var(--header-height));
      left: 0;
      padding: ${theme.spacing[7]} ${theme.spacing[5]} 0;
      position: fixed;
      top: var(--header-height);
      width: var(--page-aside-nav-width);
    `};
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    overflow: auto;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]};
    margin-left: ${theme.spacing[4]};
    text-transform: uppercase;
  `}
`;

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    border-radius: ${theme.borderRadius.default};
    display: block;
    margin-bottom: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-decoration: none;

    &[data-selected='false'] {
      color: ${theme.color.tertiary};

      @media (hover: hover) {
        &:hover {
          background-color: ${theme.backgroundColor.secondary};
        }
      }
    }

    &[data-selected='true'] {
      color: ${theme.color.primary};
      background: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default PageNav;
