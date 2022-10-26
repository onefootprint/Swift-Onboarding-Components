import { useTranslation } from '@onefootprint/hooks';
import {
  Box,
  createFontStyles,
  media,
  Toggle,
  Typography,
} from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import SupportList from 'src/components/support-list';
import styled, { css } from 'styled-components';
import { useDarkMode } from 'usehooks-ts';

type ProductNavigationProps = {
  name: string;
  articles: { title: string; slug: string }[];
};

const ProductNavigation = ({ name, articles }: ProductNavigationProps) => {
  const { t } = useTranslation('components.product-navigation');
  const { isDarkMode, toggle } = useDarkMode();
  const router = useRouter();

  return (
    <Container>
      <Box>
        <Header>
          <Typography variant="caption-1">{name}</Typography>
        </Header>
        <nav>
          {articles.map(({ title, slug }) => (
            <StyledLink href={slug} data-selected={router.asPath === slug}>
              {title}
            </StyledLink>
          ))}
        </nav>
      </Box>
      <Box>
        <SupportList />
        <ThemeControl>
          <Toggle
            label={t('dark-mode')}
            checked={isDarkMode}
            onChange={toggle}
            sx={{ justifyContent: 'space-between' }}
          />
        </ThemeControl>
      </Box>
    </Container>
  );
};

const Container = styled.aside`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('sm')`
      background: ${theme.backgroundColor.primary};
      border-right: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
      display: flex;
      flex-direction: column;
      height: calc(100vh - var(--header-height));
      justify-content: space-between;
      left: 0;
      padding: ${theme.spacing[7]}px ${theme.spacing[5]}px;
      position: fixed;
      top: var(--header-height);
      width: var(--product-aside-nav-width);
    `};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
    margin-left: ${theme.spacing[4]}px;
    text-transform: uppercase;
  `}
`;

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    border-radius: ${theme.borderRadius.default}px;
    display: block;
    padding: ${theme.spacing[3]}px ${theme.spacing[4]}px;
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

const ThemeControl = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    margin: 0 -${theme.spacing[5]}px -${theme.spacing[7]}px;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
  `}
`;

export default ProductNavigation;
