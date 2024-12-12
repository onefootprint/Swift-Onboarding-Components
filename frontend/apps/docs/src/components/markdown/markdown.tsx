import { createFontStyles } from '@onefootprint/ui';
import type { MarkdownToJSX } from 'markdown-to-jsx';
import { default as BaseMarkdown } from 'markdown-to-jsx';
import styled, { css } from 'styled-components';

import Banner from '../introduction/banner';
import SectionCards from '../introduction/section-cards';
import A from './components/a';
import Code from './components/code';
import DemoOcKyc from './components/demo-oc-kyc';
import DemoReact from './components/demo-react';
import DocsInlineAlert from './components/docs-inline-alert';
import Examples from './components/examples';
import H1 from './components/h1';
import H2 from './components/h2';
import H3 from './components/h3';
import H4 from './components/h4';
import H5 from './components/h5';
import Img from './components/img';
import NavigationLink from './components/navigation-link';
import Strong from './components/strong';
import Table from './components/table';

const OVERRIDES: MarkdownToJSX.Overrides = {
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

type MarkdownProps = {
  id?: string;
  children: string;
  overrides?: MarkdownToJSX.Overrides;
};

const Markdown = ({ children, id, overrides }: MarkdownProps) => {
  const allOverrides = {
    ...OVERRIDES,
    ...overrides,
  };
  return (
    <StyledMarkdown options={{ overrides: allOverrides }} id={id}>
      {children}
    </StyledMarkdown>
  );
};

const StyledMarkdown = styled(BaseMarkdown)`
  ${({ theme }) => css`
    ${createFontStyles('body-1')};
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
      margin-bottom: ${theme.spacing[7]};
    }

    pre > div {
      margin-bottom: ${theme.spacing[9]};
    }
  `};
`;

export default Markdown;
