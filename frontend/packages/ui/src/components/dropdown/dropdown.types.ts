import type { Spacings } from '@onefootprint/design-tokens';
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
  height?: string;
  onSelect?: (event: Event) => void;
};

export type TriggerProps = DropdownMenuTriggerProps & {
  hasChevron?: boolean;
  asButton?: boolean;
  variant?: 'default' | 'chevron' | 'icon' | 'button';
  width?: Spacings;
  height?: Spacings;
};

export type RadioItemProps = DropdownMenuRadioItemProps & {
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
