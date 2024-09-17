import type { Icon } from '@onefootprint/icons';
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSubContentProps,
  DropdownMenuTriggerProps,
} from '@radix-ui/react-dropdown-menu';
import type * as CSS from 'csstype';

export const DROPDOWN_ITEM_SIZE = {
  default: '36px',
  compact: '32px',
  tiny: '28px',
};

export type ItemProps = DropdownMenuItemProps & {
  iconLeft?: Icon;
  iconRight?: Icon;
  checked?: boolean;
  asLink?: boolean;
  size?: 'default' | 'compact' | 'tiny';
  variant?: 'default' | 'destructive';
  height?: CSS.Property.Height;
  onSelect?: (event: Event) => void;
};

export type TriggerProps = DropdownMenuTriggerProps & {
  variant?: 'default' | 'chevron';
  maxWidth?: CSS.Property.Width;
};

export type RadioItemProps = DropdownMenuRadioItemProps & {
  height?: CSS.Property.Height;
  value: string;
  onSelect: (event: Event) => void;
};

export type ContentProps = DropdownMenuContentProps & {
  children: React.ReactNode;
  minWidth?: CSS.Property.Width;
  maxWidth?: CSS.Property.Width;
  width?: CSS.Property.Width;
};

export type SubContentProps = DropdownMenuSubContentProps & {
  children: React.ReactNode;
  minWidth?: CSS.Property.Width;
  maxWidth?: CSS.Property.Width;
};

export type BaseItemContainerProps = {
  $height?: CSS.Property.Height;
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
  layout?: 'default' | 'radio-item';
};
