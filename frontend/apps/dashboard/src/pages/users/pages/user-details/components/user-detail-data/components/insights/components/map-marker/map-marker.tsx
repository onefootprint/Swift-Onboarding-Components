import React from 'react';
import styled, { css } from 'styled-components';

type MapMarkerProps = {
  // These props aren't used by us, but the google map library looks for them
  // eslint-disable-next-line react/no-unused-prop-types
  lat: number;
  // eslint-disable-next-line react/no-unused-prop-types
  lng: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MapMarker = (props: MapMarkerProps) => (
  <MapMarkerContainer>
    <MapMarkerDot />
  </MapMarkerContainer>
);

const MapMarkerContainer = styled.div`
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => css`
    backdrop-filter: brightness(0.9);
    width: 324px;
    height: 324px;
    border-radius: ${theme.borderRadius.full};
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
