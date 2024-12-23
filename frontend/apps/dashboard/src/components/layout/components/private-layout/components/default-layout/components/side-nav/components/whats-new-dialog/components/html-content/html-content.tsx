import { createFontStyles, media } from '@onefootprint/ui';
import DOMPurify from 'dompurify';
import styled, { css } from 'styled-components';

type ChangelogContentProps = {
  html: string;
};

const HtmlContent = ({ html }: ChangelogContentProps) => (
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized with DOMPurify
  <Content dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} /> // nosemgrep
);

const Content = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.secondary};

    ${media.greaterThan('md')`
      padding-right: ${theme.spacing[9]};
    `}

    p {
      ${createFontStyles('body-2')};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[5]};
      }
    }

    a {
      color: ${theme.color.accent};

      @media (hover: hover) {
        &:hover {
          opacity: 0.8;
        }
      }
    }

    strong {
      font-weight: 700;
    }

    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${theme.color.primary};
      margin-top: ${theme.spacing[7]};

      &:not(:last-child) {
        margin-bottom: ${theme.spacing[7]};
      }
    }

    h2 {
      ${createFontStyles('heading-2')};
    }

    h3 {
      ${createFontStyles('heading-3')};
    }

    ol {
      ${createFontStyles('body-2')};
      margin-bottom: ${theme.spacing[7]};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[3]};

      li {
        list-style-type: decimal;
      }
    }

    ul {
      ${createFontStyles('body-2')};
      margin-bottom: ${theme.spacing[7]};
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[3]};

      li:before {
        content: '•';
        margin: ${theme.spacing[3]};
        color: ${theme.color.tertiary};
      }
    }

    img {
      max-width: 100%;
      object-fit: contain;
      height: auto;
      margin-bottom: ${theme.spacing[7]};
      border-radius: ${theme.borderRadius.default};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default HtmlContent;
