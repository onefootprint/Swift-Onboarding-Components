import { Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import type { Article } from '../../media.types';

type ArticleItemProps = Article;

const ArticleItem = ({ publishedAt, excerpt, imageAlt, imageUrl, title, url, website }: ArticleItemProps) => (
  <article>
    <Anchor href={url} target="_blank" rel="noreferrer">
      <Content>
        <Text color="accent" variant="body-3" marginBottom={3}>
          {website}
        </Text>
        <Text variant="heading-3" tag="h3" marginBottom={2}>
          {title}
        </Text>
        <Text color="secondary" variant="body-2" tag="p" marginBottom={5}>
          {excerpt}
        </Text>
        <Text color="tertiary" variant="body-3" tag="div">
          {publishedAt}
        </Text>
      </Content>
      <Picture>
        <Image alt={imageAlt} height={400} src={imageUrl} width={400} />
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
  ${({ theme }) => css`
    display: none;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    width: 128px;
    height: 128px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

export default ArticleItem;
