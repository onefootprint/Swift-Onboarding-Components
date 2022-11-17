import { createFontStyles } from '@onefootprint/ui';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import React from 'react';
import SEO from 'src/components/seo';
import styled, { css } from 'styled-components';

import type { Article } from '../../types/article';
import type { Page } from '../../types/page';
import ArticleHeader from './components/article-header';
import Layout from './components/layout';
import A from './components/markdown-components/a';
import Code from './components/markdown-components/code';
import DocsInlineAlert from './components/markdown-components/docs-inline-alert';
import H1 from './components/markdown-components/h1';
import H2 from './components/markdown-components/h2';
import H3 from './components/markdown-components/h3';
import Strong from './components/markdown-components/strong';

type ArticleProps = {
  page: Page;
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

const ArticlePage = ({ page, article }: ArticleProps) => (
  <>
    <SEO
      description={article.data.meta.description}
      slug={article.data.slug}
      title={article.data.meta.title}
    />
    <Layout page={page} article={article}>
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
      margin-bottom: ${theme.spacing[7]};
    }

    h1,
    h2,
    h3 {
      margin-bottom: ${theme.spacing[7]};
    }

    a {
      &:not(:first-child) {
        h2 {
          margin-top: ${theme.spacing[10]};
        }
      }
    }

    ol {
      padding-left: ${theme.spacing[5]};
      list-style: octal;

      ul {
        margin-left: ${theme.spacing[7]};
      }

      > li {
        margin-bottom: ${theme.spacing[7]};

        p,
        li {
          margin-bottom: ${theme.spacing[3]};
        }
      }
    }

    ul {
      list-style: disc;
    }

    pre > div {
      margin-bottom: ${theme.spacing[7]};
    }
  `};
`;

export default ArticlePage;
