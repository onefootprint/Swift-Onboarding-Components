import React from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles, media } from 'ui';

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
      padding: 0 ${theme.spacing[11]}px;
    `}

    figure {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    img {
      margin-bottom: ${theme.spacing[9]}px;
      max-width: 100%;

      object-fit: cover;
      object-position: left;
      height: auto;

      ${media.greaterThan('sm')`
        max-width: calc(100% + ${2 * theme.spacing[11]}px);
        margin: ${theme.spacing[9]}px -${theme.spacing[11]}px;
      `}
    }

    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${theme.color.primary};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[6]}px;
      }
    }

    table {
      border-collapse: separate;
      border-radius: ${theme.borderRadius[2]}px;
      border: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[9]}px;
      table-layout: fixed;
      width: 100%;

      tr:not(:last-child) td {
        border-bottom: 1px solid ${theme.borderColor.tertiary};
      }

      th,
      td {
        padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;
      }

      th {
        ${createFontStyles('caption-1')};
        background: ${theme.backgroundColor.secondary};
        border-bottom: 1px solid ${theme.borderColor.tertiary};
        border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
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
      margin-bottom: ${theme.spacing[9]}px;

      li {
        list-style-type: decimal;
        list-style-position: inside;
        ${createFontStyles('body-1')};
      }
    }

    ul {
      margin-bottom: ${theme.spacing[9]}px;

      li {
        list-style-type: disc;
        list-style-position: inside;
        ${createFontStyles('body-1')};
      }
    }

    p {
      ${createFontStyles('body-1')};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[9]}px;
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
      height: ${theme.borderWidth[1]}px;
      border: 0;
    }

    figcaption {
      ${createFontStyles('body-4')}
      margin: -${theme.spacing[9]}px 0 ${theme.spacing[9]}px 0;
      color: ${theme.color.quaternary};
      text-align: center;
    }
  `}
`;

export default PostContent;
