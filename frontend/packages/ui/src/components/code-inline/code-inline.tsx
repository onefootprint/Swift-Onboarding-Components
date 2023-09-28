import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { createFontStyles } from '../../utils/mixins';
import CopyButton from '../copy-button';

export type CodeInlineProps = {
  ariaLabel?: string;
  children: string;
  disabled?: boolean;
  tooltipText?: string;
  tooltipTextConfirmation?: string;
  truncate?: boolean;
  isPrivate?: boolean;
  size?: 'default' | 'compact';
};

const CodeInline = ({
  ariaLabel = 'Copy to clipboard',
  children,
  disabled,
  tooltipText = 'Copy to clipboard',
  tooltipTextConfirmation = 'Copied!',
  truncate,
  isPrivate,
  size = 'default',
}: CodeInlineProps) => {
  if (disabled) {
    return (
      <CodeContent
        data-truncate={truncate}
        data-private={isPrivate}
        size={size}
      >
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
    ${size === 'compact'
      ? createFontStyles('snippet-3', 'code')
      : createFontStyles('snippet-2', 'code')};
    text-align: left;
    white-space: break-spaces;
    word-break: break-word;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: inline-block;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.compact};
    color: ${size === 'compact' ? theme.color.secondary : theme.color.error};
    flex-flow: wrap;
    height: ${size === 'compact' ? 'auto' : ''};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};

    &[data-truncate='true'] {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      word-break: unset;
    }
  `}
`;

export default CodeInline;
