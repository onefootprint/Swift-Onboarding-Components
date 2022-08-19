import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Article } from 'src/types/article';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import SEO from '../../components/seo';
import A from './components/a';
import ArticleHeader from './components/article-header';
import Code from './components/code';
import H1 from './components/h1';
import H2 from './components/h2';
import Layout from './components/layout';

type ArticleProps = {
  product: any;
  article: Article;
};

const components = {
  a: A,
  code: Code,
  h1: H1,
  h2: H2,
};

const ArticlePage = ({ product, article }: ArticleProps) => (
  <>
    <SEO
      description={article.data.meta.description}
      slug={article.data.slug}
      title={article.data.meta.title}
    />
    <Layout product={product} article={article}>
      <Container>
        <ArticleHeader
          title={article.data.title}
          subtitle={article.data.readingTime.text}
        />
        {/* @ts-ignore */}
        <ReactMarkdown components={components}>{article.content}</ReactMarkdown>
      </Container>
    </Layout>
  </>
);

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};

    > p {
      margin-bottom: ${theme.spacing[7]}px;
    }

    h2 {
      margin-bottom: ${theme.spacing[7]}px;

      &:not(:first-of-type) {
        margin-top: ${theme.spacing[10]}px;
      }
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
      margin-top: -${theme.spacing[4]}px;
      margin-bottom: ${theme.spacing[7]}px;
    }
  `};
`;

export default ArticlePage;
