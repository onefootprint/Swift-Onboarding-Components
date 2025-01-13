import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import { capitalize } from 'lodash';

type SubcategoryToggleProps = {
  subCategoryName: string;
  onClick: () => void;
  isActive: boolean;
};

const SubcategoryToggle = ({ subCategoryName, onClick, isActive }: SubcategoryToggleProps) => {
  return (
    <button
      type="button"
      className="flex items-center gap-2 p-1 px-2 rounded group hover:bg-secondary"
      onClick={onClick}
    >
      {isActive ? <IcoMinusSmall16 /> : <IcoPlusSmall16 />}
      <h3 className="text-label-3">{capitalize(subCategoryName)}</h3>
    </button>
  );
};

export default SubcategoryToggle;
