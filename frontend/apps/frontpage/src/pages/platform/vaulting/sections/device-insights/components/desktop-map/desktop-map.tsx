import { Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import Placemark from '../placemark';
import Wave from '../wave';

const DesktopMap = () => (
  <MapBackground>
    <Metrics>
      <Image src="/vaulting/device-insights/card-data.png" width={420} height={381} alt="" />
    </Metrics>
    <PlacemarkContainer>
      <Placemark $zIndex={2} />
      <Wave initialDiameter={80} finalDiameter={240} duration={6} delay={0} $zIndex={0} />
    </PlacemarkContainer>
  </MapBackground>
);

const MapBackground = styled(Container)`
  ${({ theme }) => css`
    width: 100%;
    height: 500px;
    background-image: url('/vaulting/device-insights/map.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    border-radius: ${theme.borderRadius.default};
    display: none;

    ${media.greaterThan('md')`
        display: block;
    `}
  `}
`;

const Metrics = styled.div`
  ${({ theme }) => css`
    transform: translateY(-50%);
    position: absolute;
    top: 50%;
    left: ${theme.spacing[6]};
  `}
`;

const PlacemarkContainer = styled.div`
  isolation: isolate;
  width: 240px;
  height: 240px;
  position: absolute;
  top: 50%;
  right: 20%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default DesktopMap;
