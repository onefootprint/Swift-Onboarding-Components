import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { createFontStyles } from '../../utils/mixins';
import CopyButton from '../copy-button';

export type CodeInlineProps = {
  ariaLabel?: string;
  children: string;
  disable?: boolean;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
  truncate?: boolean;
  isPrivate?: boolean;
  size?: 'default' | 'compact';
};

const CodeInline = ({
  ariaLabel = 'Copy to clipboard',
  children,
  disable,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
  truncate,
  isPrivate,
  size = 'default',
}: CodeInlineProps) => {
  if (disable) {
    return (
      <CodeContent data-truncate={truncate} data-private={isPrivate}>
        {children}
      </CodeContent>
    );
  }

  return (
    <CopyButton
      ariaLabel={ariaLabel}
      contentToCopy={children}
      tooltipText={tooltipText}
      tooltipTextConfirmation={tooltipTextConfirmation}
    >
      <CodeContent
        data-truncate={truncate}
        data-private={isPrivate}
        size={size}
      >
        {children}
      </CodeContent>
    </CopyButton>
  );
};

const CodeContent = styled.code<{ size?: 'default' | 'compact' }>`
  ${({ theme, size }) => css`
    text-align: left;
    white-space: break-spaces;
    word-break: break-word;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${size === 'default' &&
    css`
      ${createFontStyles('snippet-2', 'code')};
      background: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.compact};
      color: ${theme.color.error};
      display: inline-block;
      flex-flow: wrap;
      height: 24px;
      height: auto;
      padding: ${theme.spacing[1]} ${theme.spacing[2]};
    `}

    ${size === 'compact' &&
    css`
      ${createFontStyles('snippet-3', 'code')};
      background: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.compact};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      color: ${theme.color.secondary};
      padding: ${theme.spacing[1]} ${theme.spacing[2]};
    `}

    &[data-truncate='true'] {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      word-break: unset;
    }
  `}
`;

export default CodeInline;
