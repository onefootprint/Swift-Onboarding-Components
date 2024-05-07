import React from 'react';
import styled, { css } from 'styled-components';

type MapMarkerProps = {
  lat: number;
  lng: number;
  isSelected?: boolean;
  icon: JSX.Element;
};

const MapMarker = ({ lat, lng, isSelected, icon }: MapMarkerProps) => (
  // TODO: STYLE
  <MapMarkerContainer data-selected={isSelected}>
    {icon}
    <MapMarkerDot data-lat={lat} data-lng={lng} />
  </MapMarkerContainer>
);

const MapMarkerContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    align-items: center;
    border-radius: 100%;
    display: flex;
    height: 324px;
    justify-content: center;
    transform: translateX(-50%) translateY(-50%);
    width: 324px;

    &::before {
      background-color: ${theme.backgroundColor.accent};
      border-radius: 100%;
      opacity: 0.15;
      content: '';
      position: absolute;
      height: 100%;
      width: 100%;
    }
  `};
`;

const MapMarkerDot = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid #fff;
    height: 16px;
    width: 16px;
  `};
`;

export default MapMarker;
