import { IcoClose24 } from '@onefootprint/icons';
import type { Icon } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../../icon-button';

import { HEADER_HEIGHT } from '../dialog.constants';

interface HeaderProps {
  title: string;
  onClose: () => void;
  icon?: {
    component: Icon;
    ariaLabel?: string;
    onClick?: () => void;
  };
}

const DialogHeader = forwardRef<HTMLDivElement, HeaderProps>(({ title, onClose, icon }, ref) => {
  const { t } = useTranslation('ui');
  const IconComponent: Icon = icon?.component ?? IcoClose24;
  // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
  const iconAriaLabel = icon?.ariaLabel ?? (t('components.dialog.header-icon.aria-label-default') as string);
  const iconOnClick = icon?.onClick ?? onClose;

  return (
    <header
      className="grid grid-cols-[32px_1fr_32px] items-center sticky px-2 top-0 z-10 bg-background-primary border-b border-tertiary border-solid rounded-t shrink-0"
      style={{
        height: `${HEADER_HEIGHT}px`,
      }}
      ref={ref}
    >
      <RadixDialog.Close asChild>
        <IconButton aria-label={iconAriaLabel} onClick={iconOnClick}>
          <IconComponent />
        </IconButton>
      </RadixDialog.Close>
      <RadixDialog.Title asChild>
        <h3 className="text-center truncate text-label-3">{title}</h3>
      </RadixDialog.Title>
    </header>
  );
});

export default DialogHeader;
