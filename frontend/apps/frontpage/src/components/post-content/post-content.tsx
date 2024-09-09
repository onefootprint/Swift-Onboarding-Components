import { createFontStyles, media } from '@onefootprint/ui';
import { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

type PostContentProps = {
  html: string;
};

const PostContent = ({ html }: PostContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const links = contentRef.current?.getElementsByTagName('a') || [];
    Array.from(links).forEach(link => {
      link.setAttribute('target', 'blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }, []);
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
    <Content dangerouslySetInnerHTML={{ __html: html }} ref={contentRef} />
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.secondary};

    figure {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    img {
      border-radius: ${theme.borderRadius.default};
      height: auto;
      margin-bottom: ${theme.spacing[9]};
      max-width: 100%;
      object-fit: cover;
      object-position: left;

      ${media.greaterThan('sm')`
        width: 100%;
      `}
    }

    video {
      border-radius: ${theme.borderRadius.default};
      height: auto;
      width: 100%;
    }

    code {
      ${createFontStyles('snippet-2', 'code')};
    }

    pre {
      text-align: left;
      padding: ${theme.spacing[5]};
      background: ${theme.backgroundColor.primary};
      display: flex;
      border: 1px solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default};
      overflow: auto;
      margin-bottom: ${theme.spacing[9]};
    }

    *:not(pre) > code {
      background: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.sm};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      color: ${theme.color.error};
      display: inline-block;
      flex-flow: wrap;
      height: 24px;
      height: auto;
      padding: ${theme.spacing[1]} ${theme.spacing[2]};
      text-align: left;
      white-space: break-spaces;
      word-break: break-word;
    }

    h1,
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
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[9]};
      table-layout: fixed;
      width: 100%;

      tr:not(:last-child) td {
        border-bottom: ${theme.borderWidth[1]} solid
          ${theme.borderColor.tertiary};
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
      margin-bottom: ${theme.spacing[8]};

      li {
        list-style-type: decimal;
        ${createFontStyles('body-1')};
        padding-left: ${theme.spacing[2]}; 

        ol {
          padding-bottom: ${theme.spacing[2]};
          padding-left: ${theme.spacing[6]};

          li {
            padding-top: ${theme.spacing[3]};
            list-style-type: lower-alpha;
            ${createFontStyles('body-1')};
            padding-left: ${theme.spacing[2]};           }
        }
      }
    }

    ul {
      margin-bottom: ${theme.spacing[8]};

      li {
        list-style-type: disc;
        ${createFontStyles('body-1')};
        padding-left: ${theme.spacing[2]}; 

        ul {
          padding-bottom: ${theme.spacing[2]};
          padding-left: ${theme.spacing[6]};

          li {
            list-style-type: circle;
            padding-top: ${theme.spacing[3]};
            ${createFontStyles('body-1')};
            padding-left: ${theme.spacing[2]};           }
        }
      }
    }

    p {
      ${createFontStyles('body-1')};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[8]};
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
      ${createFontStyles('body-3')}
      margin: -${theme.spacing[8]} 0 ${theme.spacing[9]} 0;
      color: ${theme.color.quaternary};
      text-align: center;
    }

    blockquote {
      ${createFontStyles('body-1')};
      color: ${theme.color.primary};
      padding-left: ${theme.spacing[5]};
      margin-left: ${theme.spacing[1]};
      display: block;
      border-left: 1px solid ${theme.color.quaternary};

      em {
        font-style: italic;
      }
    }
  `}
`;

export default PostContent;
