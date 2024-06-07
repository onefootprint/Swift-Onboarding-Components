import { CodeInline, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import A from 'src/components/article/components/markdown-components/a';
import styled, { css } from 'styled-components';

type DescriptionProps = {
  children: string;
};

const Description = ({ children }: DescriptionProps) => <Content>{parseElements(children)}</Content>;

/**
 * The descriptions of fields may include markdown-esque syntax for a few common elements,
 * like `monospace` and [link](href).
 * This parses the textual description into a list of elements to render for the description.
 */
const parseElements = (text: string) => {
  const elements = [];
  let i = 0;
  let lastIdx = 0;
  for (i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') {
      elements.push(text.substring(lastIdx, i));
      elements.push(<br />);
      i += 1;
      lastIdx = i;
    }
    if (text[i] === '`') {
      elements.push(text.substring(lastIdx, i));
      // Process monospace with syntax`monospaceText`
      const startIdx = i + 1;
      const nextBacktickOffset = text.substring(startIdx).indexOf('`');
      if (nextBacktickOffset === -1) {
        console.error('Mismatched backticks in text');
        // eslint-disable-next-line no-continue
        continue;
      }
      const endIdx = startIdx + nextBacktickOffset;
      const monospaceText = text.substring(startIdx, endIdx);
      elements.push(
        <CodeInline disabled size="compact" key={i}>
          {monospaceText}
        </CodeInline>,
      );
      i = endIdx + 1;
      lastIdx = i;
    }
    if (text[i] === '[') {
      elements.push(text.substring(lastIdx, i));
      // Process links with syntax [linkText](link)
      const textStartIdx = i + 1;
      const closingBraceOffset = text.substring(textStartIdx).indexOf('](');
      if (closingBraceOffset === -1) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const textEndIdx = textStartIdx + closingBraceOffset;
      const closingParenOffset = text.substring(textEndIdx).indexOf(')');
      if (closingParenOffset === -1) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const linkEndIdx = textEndIdx + closingParenOffset;
      const linkText = text.substring(textStartIdx, textEndIdx);
      const link = text.substring(textEndIdx + 2, linkEndIdx);
      elements.push(<A href={link}>{linkText}</A>);
      i = linkEndIdx + 1;
      lastIdx = i;
    }
  }
  elements.push(text.substring(lastIdx, i));
  return elements;
};

const Content = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    align-items: center;
    color: ${theme.color.tertiary};
    display: inline;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-right: ${theme.spacing[2]};
  `}
`;

export default Description;
