import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import CopyButton from '../copy-button';
import Text from '../text';

export type CodeInlineProps = {
  ariaLabel?: string;
  children: string;
  disabled?: boolean;
  truncate?: boolean;
  isPrivate?: boolean;
  size?: 'default' | 'compact';
  tooltip?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    text?: string;
    textConfirmation?: string;
  };
};

const CodeInline = ({
  ariaLabel,
  children,
  disabled,
  tooltip,
  truncate,
  isPrivate,
  size = 'default',
}: CodeInlineProps) => {
  const { t } = useTranslation('ui');

  if (disabled) {
    return (
      <CodeContent
        variant={size === 'compact' ? 'snippet-3' : 'snippet-2'}
        data-disabled={disabled}
        truncate={truncate}
        tag="code"
        {...(isPrivate && { 'data-dd-privacy': 'mask' })}
      >
        {children}
      </CodeContent>
    );
  }

  return (
    <CopyButton
      contentToCopy={children}
      ariaLabel={ariaLabel ?? t('components.code-inline.aria-label-default')}
      tooltip={{
        position: tooltip?.position ?? 'top',
        text: tooltip?.text ?? t('components.code-inline.tooltip-text-default'),
        textConfirmation: tooltip?.textConfirmation ?? t('components.code-inline.tooltip-text-confirmation-default'),
      }}
    >
      <CodeContent
        variant={size === 'compact' ? 'snippet-3' : 'snippet-2'}
        data-disabled={disabled}
        truncate={truncate}
        tag="code"
        {...(isPrivate && { 'data-dd-privacy': 'mask' })}
      >
        {children}
      </CodeContent>
    </CopyButton>
  );
};

const CodeContent = styled(Text)`
  ${({ theme }) => css`
    text-align: left;
    white-space: break-spaces;
    word-break: break-word;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: inline-block;
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.sm};
    color: ${theme.color.secondary};
    flex-flow: wrap;
    padding: ${theme.spacing[1]} ${theme.spacing[2]};

    &:not([data-disabled='true']) {
      &:hover {
        cursor: pointer;
        color: ${theme.color.primary};
        border-color: ${theme.borderColor.primary};
      }
    }

  `}
`;

export default CodeInline;
