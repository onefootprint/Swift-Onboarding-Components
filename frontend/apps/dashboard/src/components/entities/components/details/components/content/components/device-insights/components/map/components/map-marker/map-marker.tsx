import styled, { css } from '@onefootprint/styled';
import React from 'react';

type MapMarkerProps = {
  lat: number;
  lng: number;
};

const MapMarker = ({ lat, lng }: MapMarkerProps) => (
  <MapMarkerContainer>
    <MapMarkerDot data-lat={lat} data-lng={lng} />
  </MapMarkerContainer>
);

const MapMarkerContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    backdrop-filter: brightness(0.9);
    border-radius: ${theme.borderRadius.full};
    display: flex;
    height: 324px;
    justify-content: center;
    transform: translateX(-50%) translateY(-50%);
    width: 324px;
  `};
`;

const MapMarkerDot = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid #fff;
    height: 16px;
    width: 16px;
  `};
`;

export default MapMarker;
