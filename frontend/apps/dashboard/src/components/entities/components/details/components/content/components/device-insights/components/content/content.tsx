import { InsightEvent } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import FloatingBox from '../floating-box';
import Map from '../map';

export type ContentProps = {
  insightEvent?: InsightEvent;
  hasBiometrics: boolean;
};

const Content = ({ insightEvent, hasBiometrics }: ContentProps) => (
  <MapContainer>
    <Map
      latitude={insightEvent ? insightEvent.latitude : null}
      longitude={insightEvent ? insightEvent.longitude : null}
    />
    <FloatingBox
      hasInsights={!!insightEvent}
      city={insightEvent?.city || null}
      country={insightEvent?.country || null}
      hasBiometrics={hasBiometrics}
      ipAddress={insightEvent?.ipAddress || null}
      region={insightEvent?.region || null}
      userAgent={insightEvent?.userAgent || null}
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
