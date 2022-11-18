import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PostContentProps = {
  html: string;
};
const PostContent = ({ html }: PostContentProps) => (
  <Content dangerouslySetInnerHTML={{ __html: html }} />
);

const Content = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.secondary};

    ${media.greaterThan('sm')`
      padding: 0 ${theme.spacing[11]};
    `}

    figure {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    img {
      margin-bottom: ${theme.spacing[9]};
      max-width: 100%;
      object-fit: cover;
      object-position: left;
      height: auto;

      ${media.greaterThan('sm')`
        max-width: calc(100% + ${theme.spacing[11]} + ${theme.spacing[11]});
        margin: ${theme.spacing[9]} -${theme.spacing[11]};
      `}
    }

    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${theme.color.primary};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[6]};
      }
    }

    table {
      border-collapse: separate;
      border-radius: ${theme.borderRadius.default};
      border: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[9]};
      table-layout: fixed;
      width: 100%;

      tr:not(:last-child) td {
        border-bottom: 1px solid ${theme.borderColor.tertiary};
      }

      th,
      td {
        padding: ${theme.spacing[5]} ${theme.spacing[6]};
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

    h2 {
      ${createFontStyles('heading-2')};
    }

    h3 {
      ${createFontStyles('heading-3')};
    }

    ol {
      margin-bottom: ${theme.spacing[9]};

      li {
        list-style-type: decimal;
        list-style-position: inside;
        ${createFontStyles('body-1')};
      }
    }

    ul {
      margin-bottom: ${theme.spacing[9]};

      li {
        list-style-type: disc;
        list-style-position: inside;
        ${createFontStyles('body-1')};
      }
    }

    p {
      ${createFontStyles('body-1')};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[9]};
      }
    }

    a {
      color: ${theme.color.accent};
    }

    strong {
      ${createFontStyles('label-1')}
    }

    hr {
      background-color: ${theme.borderColor.tertiary};
      height: ${theme.borderWidth[1]};
      border: 0;
    }

    figcaption {
      ${createFontStyles('body-4')}
      margin: -${theme.spacing[9]} 0 ${theme.spacing[9]} 0;
      color: ${theme.color.quaternary};
      text-align: center;
    }
    blockquote {
      em {
        ${createFontStyles('body-1')};
        color: ${theme.color.primary};
        padding-left: ${theme.spacing[5]};
        margin-left: ${theme.spacing[1]};
        display: block;
        border-left: 1px solid ${theme.color.quaternary};
        font-style: italic;
      }
    }
  `}
`;

export default PostContent;
