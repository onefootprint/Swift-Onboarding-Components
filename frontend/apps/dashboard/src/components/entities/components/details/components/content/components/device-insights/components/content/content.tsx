import type { InsightEvent } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import FloatingBox from '../floating-box';
import Map from '../map';

export type ContentProps = {
  deviceInfo: { appClip: boolean; instantApp: boolean; web: boolean };
  hasBiometrics: boolean;
  insight?: InsightEvent;
};

const Content = ({ insight, hasBiometrics, deviceInfo }: ContentProps) => (
  <MapContainer>
    <Map
      latitude={insight ? insight.latitude : null}
      longitude={insight ? insight.longitude : null}
    />
    <FloatingBox
      city={insight?.city || null}
      country={insight?.country || null}
      deviceInfo={deviceInfo}
      hasBiometrics={hasBiometrics}
      hasInsights={!!insight}
      ipAddress={insight?.ipAddress || null}
      region={insight?.region || null}
      userAgent={insight?.userAgent || null}
    />
  </MapContainer>
);

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
