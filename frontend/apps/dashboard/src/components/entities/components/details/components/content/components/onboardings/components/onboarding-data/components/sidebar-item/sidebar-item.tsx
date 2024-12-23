import type { Icon } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';

type SidebarItemProps = {
  icon: Icon;
  isSelected: boolean;
  onClick: () => void;
  title: string;
};

const SidebarItem = ({ icon: Icon, isSelected, onClick, title }: SidebarItemProps) => (
  <button
    className={cx(
      'flex items-center gap-2 w-full px-3 py-2 text-label-3 rounded hover:bg-secondary transition-colors duration-150 focus-visible:outline-none',
      {
        'text-primary bg-secondary': isSelected,
        'text-tertiary': !isSelected,
      },
    )}
    onClick={onClick}
    type="button"
    role="menuitem"
    tabIndex={0}
  >
    <Icon color={isSelected ? 'primary' : 'tertiary'} />
    <span>{title}</span>
  </button>
);

export default SidebarItem;
