import { IcoBuilding16, IcoMapPinDefault, IcoMapPinSelected } from '@onefootprint/icons';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

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
    <MapMarkerContainer id={id} onClick={() => onClick?.()} data-latitude={latitude} data-longitude={longitude}>
      <Pin>{isSelected ? <IcoMapPinSelected /> : <IcoMapPinDefault />}</Pin>
      <IconContainer>
        <IcoBuilding16 color={isSelected ? iconColorSelected : iconColorDefault} />
      </IconContainer>
    </MapMarkerContainer>
  );
};

const MapMarkerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Pin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    overflow: visible;

    path {
      filter: drop-shadow(0px 1px 12px rgba(5, 5, 5, 0.18));
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -90%);
`;

export default MapMarker;
