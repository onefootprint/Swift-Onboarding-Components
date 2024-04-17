import { IcoChevronLeft16 } from '@onefootprint/icons';
import { type Entity, type Liveness, LivenessKind } from '@onefootprint/types';
import { mostRecentWorkflow } from '@onefootprint/types/src/data/entity';
import { Divider, Select } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Map from '../map';
import type { DetailCardProps } from './components/detail-card';
import DetailCard from './components/detail-card';

export type ContentProps = {
  entity: Entity;
  livenessData: Liveness[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Content = ({ entity, livenessData }: ContentProps) => {
  const mostRecentWfInsight = entity.workflows
    .filter(wf => !!wf.insightEvent)
    .sort(mostRecentWorkflow)[0]?.insightEvent;
  const biometricCred = livenessData?.find(
    e => e.kind === LivenessKind.passkey,
  );
  const insight = biometricCred?.insight || mostRecentWfInsight;
  // const hasBiometrics = !!biometricCred;
  // const attestation = biometricCred?.linkedAttestations.at(0);
  // const deviceInfo = {
  //   appClip: attestation?.deviceType === 'ios',
  //   instantApp: attestation?.deviceType === 'android',
  //   web: !attestation,
  // };

  // TODO: fill with insight events and address data decrypted for user
  const cardData: DetailCardProps[] = [];
  const [detailsHidden, setDetailsHidden] = useState(false);

  return (
    <Container>
      <DetailsContainer data-hidden={detailsHidden}>
        <DetailsWithToggle>
          {/* TODO: implement these when designs are finalized */}
          <Select
            options={[
              { label: 'Device', value: 'device' },
              { label: 'Location', value: 'location' },
              { label: 'Network', value: 'network' },
              { label: 'User', value: 'user' },
            ]}
          />
          <Divider />
          <CardsContainer>
            {cardData.map(info => (
              <DetailCard
                isSelected={info.isSelected}
                type={info.type}
                deviceInfo={info.deviceInfo}
                hasBiometrics={info.hasBiometrics}
                ipAddress={info.ipAddress}
                region={info.region}
                regionName={info.regionName}
                country={info.country}
                city={info.city}
                timestamp={info.timestamp}
                userAgent={info.userAgent}
              />
            ))}
          </CardsContainer>
          <DetailsToggle
            data-hidden={detailsHidden}
            onClick={() => setDetailsHidden(!detailsHidden)}
          >
            <IcoChevronLeft16 />
          </DetailsToggle>
        </DetailsWithToggle>
      </DetailsContainer>
      <MapContainer>
        <Map
          latitude={insight ? insight.latitude : null}
          longitude={insight ? insight.longitude : null}
        />
      </MapContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    height: 584px;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    position: relative;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const MapContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const DetailsContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 428px;
    height: 100%;
    z-index: ${theme.zIndex.dialog};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default} 0 0
      ${theme.borderRadius.default};
    transition: transform 0.3s ease-in-out;
    box-shadow: ${theme.elevation[1]};

    @media (max-width: 960px) {
      width: 100%;
      border-radius: ${theme.borderRadius.default};
      border-right: none;
    }

    &[data-hidden='true'] {
      transform: translateX(-100%);
      box-shadow: none;
      border-right: none;
    }
  `}
`;

const DetailsWithToggle = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[4]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default} 0 0
      ${theme.borderRadius.default};

    @media (max-width: 960px) {
      border-radius: ${theme.borderRadius.default};
    }
  `}
`;

const DetailsToggle = styled.div`
  ${({ theme }) => css`
    display: flex;
    width: 26px;
    height: 32px;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 16px;
    right: -26px;
    border-radius: 0 ${theme.borderRadius.default} ${theme.borderRadius.default}
      0;
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[2]} ${theme.spacing[1]} ${theme.spacing[2]}
      ${theme.spacing[1]};
    box-shadow: inset 0px 1px 4px 0px #0000001f;
    cursor: pointer;

    @media (max-width: 960px) {
      display: none;
    }

    &[data-hidden='true'] {
      svg {
        transform: scaleX(-1);
      }
    }
  `}
`;

const CardsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default Content;
