import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
  ariaLabel,
  children,
  disabled,
  tooltipText,
  tooltipTextConfirmation,
  truncate,
  isPrivate,
  size = 'default',
}: CodeInlineProps) => {
  const { t } = useTranslation('ui');

  if (disabled) {
    return (
      <CodeContent data-truncate={truncate} size={size} {...(isPrivate && { 'data-dd-privacy': 'mask' })}>
        {children}
      </CodeContent>
    );
  }

  return (
    <CopyButton
      contentToCopy={children}
      ariaLabel={ariaLabel ?? t('components.code-inline.aria-label-default')}
      tooltipText={tooltipText ?? t('components.code-inline.tooltip-text-default')}
      tooltipTextConfirmation={tooltipTextConfirmation ?? t('components.code-inline.tooltip-text-confirmation-default')}
    >
      <CodeContent data-truncate={truncate} size={size} {...(isPrivate && { 'data-dd-privacy': 'mask' })}>
        {children}
      </CodeContent>
    </CopyButton>
  );
};

const CodeContent = styled.code<{ size?: 'default' | 'compact' }>`
  ${({ theme, size }) => css`
    ${size === 'compact' ? createFontStyles('snippet-3', 'code') : createFontStyles('snippet-2', 'code')};
    text-align: left;
    white-space: break-spaces;
    word-break: break-word;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: inline-block;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.sm};
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
