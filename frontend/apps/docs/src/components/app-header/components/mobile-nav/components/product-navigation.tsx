import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import SupportList from 'src/components/support-list';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';

type ProductNavigationProps = {
  articles: ProductArticle[];
};

const ProductNavigation = ({ articles }: ProductNavigationProps) => {
  const router = useRouter();

  return (
    <Container>
      <nav>
        {articles.map(({ title, slug }) => (
          <Link href={slug} key={slug}>
            <Anchor href={slug} data-selected={router.asPath === slug}>
              {title}
            </Anchor>
          </Link>
        ))}
      </nav>
      <SupportList />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[5]}px;
    display: flex;
    flex-direction: column;

    ul {
      padding-top: ${theme.spacing[5]}px;
    }
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
