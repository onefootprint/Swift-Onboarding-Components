import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import React from 'react';
import type { Article } from 'src/types/article';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import SEO from '../../components/seo';
import A from './components/a';
import ArticleHeader from './components/article-header';
import Code from './components/code';
import DocsInlineAlert from './components/docs-inline-alert';
import H1 from './components/h1';
import H2 from './components/h2';
import H3 from './components/h3';
import Layout from './components/layout';
import Strong from './components/strong';

type ArticleProps = {
  product: any;
  article: Article;
};

const overrides: MarkdownToJSX.Overrides = {
  a: {
    component: A,
  },
  code: {
    component: Code,
  },
  h1: {
    component: H1,
  },
  h2: {
    component: H2,
  },
  h3: {
    component: H3,
  },
  strong: {
    component: Strong,
  },
  'inline-alert': {
    component: DocsInlineAlert,
  },
};

const ArticlePage = ({ product, article }: ArticleProps) => (
  <>
    <SEO
      description={article.data.meta.description}
      slug={article.data.slug}
      title={article.data.meta.title}
    />
    <Layout product={product} article={article}>
      <ArticleHeader
        title={article.data.title}
        subtitle={article.data.readingTime.text}
      />
      <Container options={{ overrides }}>{article.content}</Container>
    </Layout>
  </>
);

const Container = styled(Markdown)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')};
    color: ${theme.color.secondary};

    > p {
      margin-bottom: ${theme.spacing[7]}px;
    }

    h1,
    h2,
    h3 {
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
      margin-top: -${theme.spacing[3]}px;
      margin-bottom: ${theme.spacing[8]}px;
    }
  `};
`;

export default ArticlePage;
