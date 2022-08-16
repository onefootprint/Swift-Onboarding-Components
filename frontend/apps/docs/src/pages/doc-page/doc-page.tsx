import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Page } from 'src/types/page';
import styled, { css } from 'styled-components';
import { createFontStyles } from 'ui';

import Code from './components/code';
import H2 from './components/h2';
import H3 from './components/h3';

type DocPageProps = {
  page: Page;
};

const components = {
  code: Code,
  h2: H2,
  h3: H3,
};

// TODO:
// https://linear.app/footprint/issue/FP-1077/seo
// https://linear.app/footprint/issue/FP-1076/adjust-spacings-based-on-layout
const DocPage = ({ page }: DocPageProps) => (
  <Container>
    {/* @ts-ignore */}
    <ReactMarkdown components={components}>{page.content}</ReactMarkdown>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    a {
      color: ${theme.color.accent};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

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
        margin-bottom: ${theme.spacing[8]}px;
      }
    }

    ul {
      list-style: disc;
    }
  `};
`;

export default DocPage;
