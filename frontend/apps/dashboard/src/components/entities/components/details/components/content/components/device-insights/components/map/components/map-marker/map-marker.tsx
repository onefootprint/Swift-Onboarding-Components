import type { Color } from '@onefootprint/design-tokens';
import { IcoMapPinDefault, IcoMapPinSelected } from '@onefootprint/icons';
import { useTheme } from 'next-themes';
import React from 'react';
import styled from 'styled-components';

export type MapMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  isSelected?: boolean;
  getIcon: (color?: Color) => JSX.Element;
  onClick?: (id: string, lat: number, lng: number) => void;
};

const MapMarker = ({ id, onClick, lat, lng, isSelected, getIcon }: MapMarkerProps) => {
  const theme = useTheme();
  const isDark = theme.theme === 'dark';
  const iconColorDefault = isDark ? 'tertiary' : 'primary';
  const iconColorSelected = isDark ? 'primary' : 'quinary';

  return (
    <MapMarkerContainer id={id} onClick={() => onClick?.(id, lat, lng)} data-lat={lat} data-lng={lng}>
      <Pin>{isSelected ? <IcoMapPinSelected /> : <IcoMapPinDefault />}</Pin>
      <Icon>{getIcon(isSelected ? iconColorSelected : iconColorDefault)}</Icon>
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

const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -90%);
`;

export default MapMarker;
