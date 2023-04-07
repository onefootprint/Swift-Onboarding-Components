import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/entity/components/with-entity';

import Section from '../section';
import FloatingBox from './components/floating-box';
import Map from './components/map';

export type DeviceInsightsProps = WithEntityProps;

const DeviceInsights = ({ entity }: DeviceInsightsProps) => {
  const { t } = useTranslation('pages.entity.device-insights');
  const insightEvent = entity.onboarding?.insightEvent;

  return insightEvent ? (
    <Section title={t('title')}>
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
    </Section>
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
