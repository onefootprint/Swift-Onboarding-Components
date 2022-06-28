import GoogleMapReact from 'google-map-react';
import IcoAppleColored24 from 'icons/ico/ico-apple-colored-24';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import { getRegionForInsightEvent } from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Divider, Typography } from 'ui';

import MapMarker from './components/map-marker';
import mapStyles from './insight.styles';

type InsightsProps = {
  user: User;
};

const Insights = ({ user }: InsightsProps) => {
  const insightEvent =
    user.insightEvent?.latitude !== undefined &&
    user.insightEvent?.longitude !== undefined &&
    user.insightEvent;

  if (!insightEvent) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <>
      <Typography variant="heading-3" sx={{ userSelect: 'none' }}>
        Device insights
      </Typography>
      <Box
        sx={{
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        <Divider />
      </Box>
      <Box
        sx={{
          height: '384px',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyCxod6W0c-JETh8zoEsT8bAnwJb4iUdFTo',
          }}
          defaultCenter={{
            lat: insightEvent.latitude!,
            lng: insightEvent.longitude! - 0.009,
          }}
          defaultZoom={15}
          options={{
            clickableIcons: false,
            disableDoubleClickZoom: true,
            gestureHandling: 'none',
            disableDefaultUI: true,
            keyboardShortcuts: false,
            styles: mapStyles,
          }}
        >
          <MapMarker
            key={insightEvent.timestamp}
            lat={insightEvent.latitude!}
            lng={insightEvent.longitude!}
          />
        </GoogleMapReact>
        <FloatingBox>
          <IcoAppleColored24 />
          {/* TODO https://linear.app/footprint/issue/FP-438/show-insight-event-from-webauthn-credential */}
          <Typography variant="label-2" sx={{ marginBottom: 5 }}>
            iPhone 13 Pro Max, iOS 15.5
          </Typography>
          {insightEvent.ipAddress && (
            <Row>
              <Typography variant="label-3" color="tertiary">
                IP Address
              </Typography>
              <Typography variant="body-3">{insightEvent.ipAddress}</Typography>
            </Row>
          )}
          <Row>
            <Typography variant="label-3" color="tertiary">
              Biometric
            </Typography>
            {/* TODO https://linear.app/footprint/issue/FP-438/show-insight-event-from-webauthn-credential */}
            <Typography variant="body-3">Verified</Typography>
          </Row>
          {getRegionForInsightEvent(insightEvent) && (
            <Row>
              <Typography variant="label-3" color="tertiary">
                Region
              </Typography>
              <Typography variant="body-3">
                {getRegionForInsightEvent(insightEvent)}
              </Typography>
            </Row>
          )}
          {insightEvent.country && (
            <Row>
              <Typography variant="label-3" color="tertiary">
                Country
              </Typography>
              <Typography variant="body-3">{insightEvent.country}</Typography>
            </Row>
          )}
        </FloatingBox>
      </Box>
    </>
  );
};

const FloatingBox = styled.div`
  position: absolute;
  width: 33%;
  left: 64px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 240px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.14);
  align-items: center;
  ${({ theme }) => css`
    gap: ${theme.spacing[3]}px;
    background-color: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[7]}px;
    border-radius: ${theme.borderRadius[2]}px;
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default Insights;
