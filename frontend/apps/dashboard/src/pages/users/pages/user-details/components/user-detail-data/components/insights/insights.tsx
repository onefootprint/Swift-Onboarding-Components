import { IcoCheckCircle16, IcoClose16 } from '@onefootprint/icons';
import { Box, Divider, Shimmer, Typography } from '@onefootprint/ui';
import GoogleMapReact from 'google-map-react';
import React from 'react';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import getRegionForInsightEvent from 'src/utils/insight-event-region';
import { displayForUserAgent, icoForUserAgent } from 'src/utils/user-agent';
import styled, { css } from 'styled-components';

import MapMarker from './components/map-marker';
import useUserLiveness from './hooks/use-user-liveness';
import mapStyles from './insight.styles';

const Insights = () => {
  const userId = useUserId();
  const userQuery = useUser(userId);
  const livenessQuery = useUserLiveness();

  if (!livenessQuery.data) {
    return null;
  }

  const [biometricCred] = livenessQuery.data;

  // If there's a biometric credential, use the insight event from it since it will most likely be the mobile device.
  // If there's no biometric credential, use the insight event from the onboarding, which is when the user finished
  // signing up.
  // If there's no onboarding, use the insight event from the scoped user, which is when the user started signing up.
  // We only show `Biometric: Verified` if the user has a biometric credential
  const insightEvent =
    biometricCred?.insightEvent || userQuery.data?.onboarding?.insightEvent;

  if (!insightEvent) {
    return null;
  }

  const userAgent = insightEvent?.userAgent || '';

  return (
    <>
      <Typography variant="label-1" as="h2">
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
      {livenessQuery.isLoading ? (
        <Shimmer sx={{ height: '384px' }} />
      ) : (
        <Box
          sx={{
            height: '384px',
            width: '100%',
            borderRadius: 'default',
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
            defaultZoom={13}
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
            {icoForUserAgent(userAgent)}
            <Typography variant="label-2" sx={{ marginBottom: 5 }}>
              {displayForUserAgent(userAgent)}
            </Typography>
            {insightEvent.ipAddress && (
              <Row>
                <Typography variant="label-3" color="tertiary">
                  IP Address
                </Typography>
                <Typography variant="body-3">
                  {insightEvent.ipAddress}
                </Typography>
              </Row>
            )}
            <Row>
              <Typography variant="label-3" color="tertiary">
                Biometric
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {biometricCred ? (
                  <>
                    <IcoCheckCircle16 color="success" />
                    <Typography variant="body-3" color="success">
                      Verified
                    </Typography>
                  </>
                ) : (
                  <>
                    <IcoClose16 color="error" />
                    <Typography variant="body-3" color="error">
                      Not verified
                    </Typography>
                  </>
                )}
              </Box>
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
      )}
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
    gap: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.primary};
    border: 1px solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default Insights;
