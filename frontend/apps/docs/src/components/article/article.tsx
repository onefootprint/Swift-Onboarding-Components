import styled, { css } from '@onefootprint/styled';
import { createFontStyles, media } from '@onefootprint/ui';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import React from 'react';
import SEO from 'src/components/seo';

import type { Article } from '../../types/article';
import type { Page } from '../../types/page';
import Banner from '../introduction/banner';
import SectionCards from '../introduction/section-cards';
import ArticleHeader from './components/article-header';
import Layout from './components/layout';
import A from './components/markdown-components/a';
import Code from './components/markdown-components/code';
import CompletePagePreview from './components/markdown-components/complete-page-preview';
import CustomizationPreview from './components/markdown-components/customization-preview';
import DocsInlineAlert from './components/markdown-components/docs-inline-alert';
import Examples from './components/markdown-components/examples';
import H1 from './components/markdown-components/h1';
import H2 from './components/markdown-components/h2';
import H3 from './components/markdown-components/h3';
import Img from './components/markdown-components/img';
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
  img: {
    component: Img,
  },
  strong: {
    component: Strong,
  },
  'inline-alert': {
    component: DocsInlineAlert,
  },
  'customization-preview': {
    component: CustomizationPreview,
  },
  'complete-page-preview': {
    component: CompletePagePreview,
  },
  examples: {
    component: Examples,
  },
  sectioncards: {
    component: SectionCards,
  },
  banner: {
    component: Banner,
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
    max-width: 100%;

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
      margin-bottom: ${theme.spacing[9]};
    }

    table {
      border-collapse: separate;
      border-radius: ${theme.borderRadius.default};
      border: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[9]};
      width: 100%;

      tr:not(:last-child) td {
        border-bottom: 1px solid ${theme.borderColor.tertiary};
      }

      th,
      td {
        padding: ${theme.spacing[5]} ${theme.spacing[6]};
        vertical-align: middle;
      }

      ${media.greaterThan('md')`
        code {
          white-space: nowrap;
        }
        td:nth-child(2) {
          min-width: ${theme.spacing[12]};
        } 
      `}

      tr:has(> :nth-child(2):last-child) {
        td {
          width: 50%;
        }
      }

      th {
        ${createFontStyles('caption-1')};
        background: ${theme.backgroundColor.secondary};
        border-bottom: 1px solid ${theme.borderColor.tertiary};
        border-radius: ${theme.borderRadius.default}
          ${theme.borderRadius.default} 0 0;
        color: ${theme.color.primary};
        text-align: left;
        text-transform: uppercase;
      }

      tbody {
        ${createFontStyles('body-3')};
      }
    }
  `};
`;

export default ArticlePage;
