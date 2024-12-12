import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import CopyButton from '../copy-button';

export type CodeInlineProps = {
  ariaLabel?: string;
  children: string;
  disabled?: boolean;
  isPrivate?: boolean;
  size?: 'default' | 'compact';
  tooltip?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    text?: string;
    textConfirmation?: string;
  };
};

const CodeInline = ({ ariaLabel, children, disabled, tooltip, isPrivate, size = 'default' }: CodeInlineProps) => {
  const { t } = useTranslation('ui');

  if (disabled) {
    return (
      <BaseCode size={size} disabled={disabled} isPrivate={isPrivate}>
        {children}
      </BaseCode>
    );
  }

  return (
    <CopyButton
      contentToCopy={children}
      ariaLabel={ariaLabel ?? (t('components.code-inline.aria-label-default') as string)}
      tooltip={{
        position: tooltip?.position ?? 'top',
        text: tooltip?.text ?? (t('components.code-inline.tooltip-text-default') as string),
        textConfirmation:
          tooltip?.textConfirmation ?? (t('components.code-inline.tooltip-text-confirmation-default') as string),
      }}
    >
      <BaseCode size={size} disabled={disabled} isPrivate={isPrivate}>
        {children}
      </BaseCode>
    </CopyButton>
  );
};

const BaseCode = ({ children, size, disabled, isPrivate }: CodeInlineProps) => {
  return (
    <span
      className={cx(
        'inline-flex flex-wrap flex-grow-0 px-1 py-[2px]',
        'rounded-sm cursor-pointer',
        'bg-secondary',
        'border border-solid border-tertiary text-primary',
        'max-w-full w-fit',
        {
          'cursor-default': disabled,
          'hover:text-primary hover:border-primary': !disabled,
        },
      )}
    >
      <code
        className={cx('max-w-full text-snippet-2 truncate overflow-hidden text-ellipsis', {
          'text-snippet-3': size === 'compact',
          'data-dd-privacy': isPrivate ? 'mask' : undefined,
        })}
      >
        {children}
      </code>
    </span>
  );
};

export default CodeInline;
