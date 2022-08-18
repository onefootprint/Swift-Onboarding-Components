import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Article } from 'src/types/page';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import A from './components/a';
import Code from './components/code';
import H2 from './components/h2';
import H3 from './components/h3';
import Layout from './components/layout';

type ArticleProps = {
  product: any;
  article: Article;
};

const components = {
  a: A,
  code: Code,
  h2: H2,
  h3: H3,
};

// TODO:
// https://linear.app/footprint/issue/FP-1077/seo
const ArticlePage = ({ product, article }: ArticleProps) => (
  <Layout product={product} article={article}>
    <Container>
      {/* @ts-ignore */}
      <ReactMarkdown components={components}>{article.content}</ReactMarkdown>
    </Container>
  </Layout>
);

const Container = styled.div`
  ${({ theme }) => css`
    p,
    li {
      ${createFontStyles('body-2')};
      color: ${theme.color.secondary};
    }

    ol {
      padding-left: ${theme.spacing[5]}px;
      list-style: octal;

      ul {
        margin-left: ${theme.spacing[7]}px;
      }

      > li {
        margin-bottom: ${theme.spacing[7]}px;

        p,
        li {
          margin-bottom: ${theme.spacing[3]}px;
        }
      }
    }

    ul {
      list-style: disc;
    }

    pre > div {
      margin-top: -${theme.spacing[3]}px;
      margin-bottom: ${theme.spacing[7]}px;
    }
  `};
`;

export default ArticlePage;
