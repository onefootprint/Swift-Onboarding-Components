import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/business/components/with-entity';

import SectionHeader from '../section-header';
import FloatingBox from './components/floating-box';
import Map from './components/map';

export type DeviceInsightsProps = WithEntityProps;

const DeviceInsights = ({ entity }: DeviceInsightsProps) => {
  const { t } = useTranslation('pages.business.device-insights');
  const insightEvent = entity.onboarding?.insightEvent;

  return insightEvent ? (
    <section>
      <SectionHeader title={t('title')} />
      <MapContainer>
        <Map
          latitude={insightEvent.latitude}
          longitude={insightEvent.longitude}
        />
        <FloatingBox
          city={insightEvent.city}
          country={insightEvent.country}
          ipAddress={insightEvent.ipAddress}
          region={insightEvent.region}
          userAgent={insightEvent.userAgent}
        />
      </MapContainer>
    </section>
  ) : null;
};

const MapContainer = styled.div`
  ${({ theme }) => css`
    height: 384px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
  `}
`;

export default DeviceInsights;
