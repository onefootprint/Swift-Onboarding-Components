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
    className={cx('flex items-center gap-2 w-full px-2 py-1 text-label-2 rounded hover:bg-secondary', {
      'text-primary bg-secondary': isSelected,
      'text-tertiary': !isSelected,
    })}
    onClick={onClick}
    type="button"
  >
    <Icon color={isSelected ? 'primary' : 'tertiary'} />
    <span>{title}</span>
  </button>
);

export default SidebarItem;
