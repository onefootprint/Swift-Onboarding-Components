import { IcoFilter16 } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';

type FilterButtonProps = {
  children: React.ReactNode;
  hasFilters?: boolean;
  onClick?: () => void;
};

const FilterButton = ({ children, onClick, hasFilters }: FilterButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cx(
        'text-label-3 items-center bg-primary border-tertiary rounded border border-dashed',
        'cursor-pointer flex gap-2 h-8 pl-2 pr-3 py-3',
        'transition-all duration-200 ease-in-out w-fit',
        'hover:bg-secondary',
        {
          'text-quinary bg-tertiary border-transparent hover:bg-tertiary': hasFilters,
        },
      )}
    >
      <IcoFilter16 color={hasFilters ? 'quinary' : 'secondary'} />
      {children}
    </button>
  );
};

export default FilterButton;
