import type { Spacings } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import type * as RadixDropdown from '@radix-ui/react-dropdown-menu';

export const DROPDOWN_ITEM_SIZE = {
  default: '36px',
  compact: '32px',
  tiny: '28px',
};

export type ItemProps = RadixDropdown.DropdownMenuItemProps & {
  iconLeft?: Icon;
  iconRight?: Icon;
  checked?: boolean;
  asLink?: boolean;
  size?: 'default' | 'compact' | 'tiny';
  variant?: 'default' | 'destructive';
  height?: string;
};

export type TriggerProps = {
  children: React.ReactNode;
  hasChevron?: boolean;
  asButton?: boolean;
  variant?: 'default' | 'chevron' | 'icon' | 'button';
  width?: Spacings;
  height?: Spacings;
} & RadixDropdown.DropdownMenuTriggerProps;
