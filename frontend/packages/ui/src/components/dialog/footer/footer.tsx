import { cx } from 'class-variance-authority';
import Button from '../../button';
import LinkButton from '../../link-button';
import type { DialogFooter } from '../dialog.types';

const Footer = ({ linkButton, primaryButton, secondaryButton, size, hasScroll }: DialogFooter) => {
  const hasBorder = size === 'full-screen' || hasScroll;
  const isFullScreen = size === 'full-screen';
  const isSingleButton = !secondaryButton && !linkButton && primaryButton;

  return (
    <footer
      className={cx(
        'flex flex-col flex-0 md:flex-row-reverse items-center justify-between w-full py-3 md:py-4 md:px-6 px-3 bg-background-primary relative before:transition-all before:duration-200 before:opacity-0',
        {
          'before:content-[""] before:h-[1px] before:absolute before:inset-0 before:border-t before:border-tertiary before:border-solid before:opacity-100':
            hasBorder,
        },
      )}
    >
      <div
        className={cx('flex flex-col-reverse gap-2 md:flex-row md:justify-end w-full', {
          'md:justify-between': isFullScreen && !isSingleButton,
        })}
      >
        {secondaryButton && (
          <Button
            id={secondaryButton.id}
            disabled={secondaryButton.disabled}
            form={secondaryButton.form}
            loading={secondaryButton.loading}
            loadingAriaLabel={secondaryButton.loadingAriaLabel}
            onClick={secondaryButton.onClick}
            type={secondaryButton.type}
            variant="secondary"
          >
            {secondaryButton.label}
          </Button>
        )}
        {primaryButton && (
          <Button
            id={primaryButton.id}
            disabled={primaryButton.disabled}
            form={primaryButton.form}
            loading={primaryButton.loading}
            loadingAriaLabel={primaryButton.loadingAriaLabel}
            onClick={primaryButton.onClick}
            type={primaryButton.type}
            variant="primary"
          >
            {primaryButton.label}
          </Button>
        )}
      </div>
      {linkButton && (
        <div className="flex p-3 md:p-0">
          <LinkButton onClick={linkButton.onClick} type={linkButton.type} form={linkButton.form}>
            {linkButton.label}
          </LinkButton>
        </div>
      )}
    </footer>
  );
};

export default Footer;
