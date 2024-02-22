import { media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import type { Article } from '../../media.types';

type ArticleItemProps = Article;

const ArticleItem = ({
  publishedAt,
  excerpt,
  imageAlt,
  imageUrl,
  title,
  url,
  website,
}: ArticleItemProps) => (
  <article>
    <Anchor href={url} target="_blank" rel="noreferrer">
      <Content>
        <Typography color="accent" variant="body-3" sx={{ marginBottom: 3 }}>
          {website}
        </Typography>
        <Typography variant="heading-3" as="h3" sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
        <Typography
          color="secondary"
          variant="body-2"
          as="p"
          sx={{ marginBottom: 5 }}
        >
          {excerpt}
        </Typography>
        <Typography color="tertiary" variant="body-3" as="div">
          {publishedAt}
        </Typography>
      </Content>
      <Picture>
        <Image alt={imageAlt} height={128} src={imageUrl} width={128} />
      </Picture>
    </Anchor>
  </article>
);

const Anchor = styled.a`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    text-decoration: none;

    ${media.greaterThan('lg')`
      @media (hover: hover) {
        &:hover {
          background: ${theme.backgroundColor.secondary};
        }
      }
    `}
  `}
`;

const Content = styled.div`
  width: 600px;
`;

const Picture = styled.div`
  display: none;
  img {
    object-fit: cover;
  }

  ${media.greaterThan('md')`
    display: block;
  `}
`;

export default ArticleItem;
