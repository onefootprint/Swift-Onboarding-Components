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
import Layout from './components/layout';

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
      <Container>
        <ArticleHeader
          title={article.data.title}
          subtitle={article.data.readingTime.text}
        />
        <Markdown options={{ overrides }}>{article.content}</Markdown>
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
