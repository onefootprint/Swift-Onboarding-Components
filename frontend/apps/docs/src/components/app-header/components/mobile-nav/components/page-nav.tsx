import { Box, createFontStyles, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import SupportList from 'src/components/support-list';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

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
                  data-selected={router.asPath === slug}
                  href={slug}
                  key={slug}
                >
                  {title}
                </StyledLink>
              ))}
            </nav>
          </Box>
        ))}
      </NavContainer>
      <SupportList />
    </PageNavContainer>
  );
};

const PageNavContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    ul {
      padding-top: ${theme.spacing[5]};
    }
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]};
    margin-left: ${theme.spacing[4]};
    text-transform: uppercase;
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
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

      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }

    &[data-selected='true'] {
      color: ${theme.color.primary};
      background: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default PageNav;
