import { createFontStyles } from '@onefootprint/ui';
import type { MarkdownToJSX } from 'markdown-to-jsx';
import Markdown from 'markdown-to-jsx';
import SEO from 'src/components/seo';
import styled, { css } from 'styled-components';

import type { Article } from '../../types/article';
import Banner from '../introduction/banner';
import SectionCards from '../introduction/section-cards';
import ArticleHeader from './components/article-header';
import A from './components/markdown-components/a';
import Code from './components/markdown-components/code';
import CustomizationPreview from './components/markdown-components/customization-preview';
import DemoOcKyc from './components/markdown-components/demo-oc-kyc';
import DemoReact from './components/markdown-components/demo-react';
import DocsInlineAlert from './components/markdown-components/docs-inline-alert';
import Examples from './components/markdown-components/examples';
import H1 from './components/markdown-components/h1';
import H2 from './components/markdown-components/h2';
import H3 from './components/markdown-components/h3';
import H4 from './components/markdown-components/h4';
import H5 from './components/markdown-components/h5';
import Img from './components/markdown-components/img';
import NavigationLink from './components/markdown-components/navigation-link';
import Strong from './components/markdown-components/strong';
import Table from './components/markdown-components/table';

type ArticleProps = {
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
  h4: {
    component: H4,
  },
  h5: {
    component: H5,
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
  examples: {
    component: Examples,
  },
  sectioncards: {
    component: SectionCards,
  },
  banner: {
    component: Banner,
  },
  'navigation-link': {
    component: NavigationLink,
  },
  table: {
    component: Table,
  },
  'demo-react': {
    component: DemoReact,
  },
  'demo-oc-kyc': {
    component: DemoOcKyc,
  },
};

const ArticlePage = ({ article }: ArticleProps) => (
  <>
    <SEO description={article.data.meta.description} slug={article.data.slug} title={article.data.meta.title} />
    <ArticleHeader title={article.data.title} subtitle={article.data.readingTime.text} />
    <Container options={{ overrides }} id="article-content">
      {article.content}
    </Container>
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
      padding-left: ${theme.spacing[7]};
      list-style: octal;

      > li {
        margin-bottom: ${theme.spacing[5]};

        p,
        li {
          margin-bottom: ${theme.spacing[3]};
        }
      }
    }

    ul {
      list-style: disc;
      padding-left: ${theme.spacing[7]};
    }

    pre > div {
      margin-bottom: ${theme.spacing[9]};
    }
  `};
`;

export default ArticlePage;
