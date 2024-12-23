import { IcoBuilding16, IcoMapPinDefault, IcoMapPinSelected } from '@onefootprint/icons';
import { useTheme } from 'next-themes';

export type MapMarkerProps = {
  id: string;
  onClick: () => void;
  latitude: number;
  longitude: number;
  isSelected: boolean;
};

const MapMarker = ({ id, onClick, latitude, longitude, isSelected }: MapMarkerProps) => {
  const theme = useTheme();
  const isDark = theme.theme === 'dark';
  const iconColorDefault = isDark ? 'tertiary' : 'primary';
  const iconColorSelected = isDark ? 'primary' : 'quinary';

  return (
    <button
      id={id}
      className="relative flex items-center justify-center cursor-pointer"
      onClick={onClick}
      data-latitude={latitude}
      data-longitude={longitude}
      type="button"
    >
      <div className="flex items-center justify-center [&>svg>path]:drop-shadow-lg">
        {isSelected ? <IcoMapPinSelected /> : <IcoMapPinDefault />}
      </div>
      <div className="flex justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[90%]">
        <IcoBuilding16 color={isSelected ? iconColorSelected : iconColorDefault} />
      </div>
    </button>
  );
};

export default MapMarker;
