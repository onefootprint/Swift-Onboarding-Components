import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import { capitalize } from 'lodash';

type CategoryToggleProps = {
  categoryName: string;
  onClick: () => void;
  isActive: boolean;
};

const CategoryToggle = ({ categoryName, onClick, isActive }: CategoryToggleProps) => {
  return (
    <button
      type="button"
      className="flex items-center gap-2 p-1 -ml-1 transition-colors rounded duration-50 group hover:bg-secondary"
      onClick={onClick}
    >
      {isActive ? <IcoMinusSmall16 /> : <IcoPlusSmall16 />}
      <h2 className="text-label-2">{capitalize(categoryName)}</h2>
    </button>
  );
};

export default CategoryToggle;
