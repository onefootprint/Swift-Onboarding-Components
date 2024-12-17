import type { Icon } from '@onefootprint/icons';

type SubsectionOptionProps = {
  icon: Icon;
  isSelected: boolean;
  onClick: () => void;
  title: string;
};

const SubsectionOption = ({ icon: Icon, isSelected, onClick, title }: SubsectionOptionProps) => (
  <button
    className={`flex items-center gap-2 w-full px-2 py-1 text-label-2 cursor-pointer ${
      isSelected ? 'text-accent' : 'text-secondary'
    }`}
    onClick={onClick}
    type="button"
  >
    <Icon color={isSelected ? 'accent' : 'secondary'} />
    <span>{title}</span>
  </button>
);

export default SubsectionOption;
