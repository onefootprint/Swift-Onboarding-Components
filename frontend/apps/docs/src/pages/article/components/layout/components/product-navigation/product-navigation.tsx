import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles, Typography } from 'ui';

type ProductNavigationProps = {
  name: string;
  items: { title: string; slug: string }[];
};

const ProductNavigation = ({ name, items }: ProductNavigationProps) => {
  const router = useRouter();

  return (
    <Container>
      <Header>
        <Typography variant="caption-1">{name}</Typography>
      </Header>
      <nav>
        {items.map(({ title, slug }) => (
          <Link href={slug} key={slug}>
            <Anchor href={slug} data-selected={router.asPath === slug}>
              {title}
            </Anchor>
          </Link>
        ))}
      </nav>
    </Container>
  );
};

const Container = styled.aside`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-right: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    height: 100vh;
    padding: ${theme.spacing[7]}px ${theme.spacing[5]}px;
    position: sticky;
    top: var(--header-height);
    width: 270px;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
    margin-left: ${theme.spacing[4]}px;
    text-transform: uppercase;
  `}
`;

const Anchor = styled.a`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    border-radius: ${theme.borderRadius[2]}px;
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

export default ProductNavigation;
