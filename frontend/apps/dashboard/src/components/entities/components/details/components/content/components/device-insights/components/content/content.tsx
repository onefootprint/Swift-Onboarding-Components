import { InsightEvent } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import FloatingBox from '../floating-box';
import Map from '../map';

export type ContentProps = {
  insightEvent?: InsightEvent;
  hasBiometrics: boolean;
};

const Content = ({ insightEvent, hasBiometrics }: ContentProps) =>
  insightEvent ? (
    <MapContainer>
      <Map
        latitude={insightEvent.latitude}
        longitude={insightEvent.longitude}
      />
      <FloatingBox
        city={insightEvent.city}
        country={insightEvent.country}
        hasBiometrics={hasBiometrics}
        ipAddress={insightEvent.ipAddress}
        region={insightEvent.region}
        userAgent={insightEvent.userAgent}
      />
    </MapContainer>
  ) : null;

const MapContainer = styled.div`
  ${({ theme }) => css`
    height: 384px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
  `}
`;

export default Content;
