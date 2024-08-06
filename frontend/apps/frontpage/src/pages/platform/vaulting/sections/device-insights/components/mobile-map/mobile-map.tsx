import { media } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

import Placemark from '../placemark';

const MobileMap = () => (
  <Container>
    <MapContainer>
      <PhoneImage src="/vaulting/device-insights/mobile-map.png" width={895} height={2011} alt="" />
      <PlacemarkContainer>
        <Placemark />
      </PlacemarkContainer>
    </MapContainer>
    <Metrics src="/vaulting/device-insights/card-data.png" width={420} height={381} alt="" />
  </Container>
);

const PhoneImage = styled(Image)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  height: auto;
  transform: rotateY(-10deg) rotateX(10deg) scale(0.8);
  perspective: 1000px;

  img {
    display: block;
    margin: 0 auto;
    object-fit: contain;
  }
`;

const PlacemarkContainer = styled.div`
  position: absolute;
  isolation: isolate;
  transform: rotateY(0deg) rotateX(10deg) translateY(-50%);
  width: 240px;
  height: 240px;
  top: 50%;
  right: 15%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(212, 212, 246, 0.1);
  border-radius: 50%;
`;

const MapContainer = styled.div`
  display: block;
  position: relative;
  overflow: hidden;
  perspective: 1000px;
  mask: radial-gradient(
    100% 75% at 50% 0%,
    black 0%,
    black 80%,
    transparent 100%
  );
  mask-mode: alpha;
`;

const Metrics = styled(Image)`
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  ${media.greaterThan('md')`
    display: none;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[12]};
    display: block;

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;
export default MobileMap;
