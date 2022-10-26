import { rgba } from 'polished';
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
    background-color: ${rgba(theme.backgroundColor.accent, 0.1)};
    width: 324px;
    height: 324px;
    border-radius: ${theme.borderRadius.full}px;
  `};
`;

const MapMarkerDot = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
    border: 2px solid #fff;
    width: 16px;
    height: 16px;
    border-radius: ${theme.borderRadius.full}px;
  `};
`;

export default MapMarker;
