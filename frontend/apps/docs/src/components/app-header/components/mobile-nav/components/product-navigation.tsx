import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

type ProductNavigationProps = {
  articles: ProductArticle[];
};

const ProductNavigation = ({ articles }: ProductNavigationProps) => {
  const router = useRouter();

  return (
    <nav>
      {articles.map(({ title, slug }) => (
        <Link href={slug} key={slug}>
          <Anchor href={slug} data-selected={router.asPath === slug}>
            {title}
          </Anchor>
        </Link>
      ))}
    </nav>
  );
};

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
