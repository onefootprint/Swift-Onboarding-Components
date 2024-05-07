import { IcoMapPinDefault, IcoMapPinSelected } from '@onefootprint/icons';
import React from 'react';
import styled from 'styled-components';

type MapMarkerProps = {
  lat: number;
  lng: number;
  isSelected?: boolean;
  icon: JSX.Element;
};

const MapMarker = ({ lat, lng, isSelected, icon }: MapMarkerProps) => (
  <MapMarkerContainer data-selected={isSelected} data-lat={lat} data-lng={lng}>
    <Pin>{isSelected ? <IcoMapPinSelected /> : <IcoMapPinDefault />}</Pin>
    <Icon>{icon}</Icon>
  </MapMarkerContainer>
);

const MapMarkerContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%) translateY(-50%);
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
  transform: translate(-50%, -70%);
`;

export default MapMarker;
