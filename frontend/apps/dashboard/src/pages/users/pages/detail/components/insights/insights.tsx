import GoogleMapReact from 'google-map-react';
import IcoAndroidColored24 from 'icons/ico/ico-android-colored-24';
import IcoAppleColored24 from 'icons/ico/ico-apple-colored-24';
import IcoCheckCircle16 from 'icons/ico/ico-check-circle-16';
import IcoClose16 from 'icons/ico/ico-close-16';
import IcoCode24 from 'icons/ico/ico-code-24';
import IcoLaptop24 from 'icons/ico/ico-laptop-24';
import IcoPhone24 from 'icons/ico/ico-phone-24';
import IcoUser24 from 'icons/ico/ico-user-24';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import { getRegionForInsightEvent } from 'src/types';
import styled, { css } from 'styled-components';
import UAParser from 'ua-parser-js';
import { Box, Divider, Shimmer, Typography } from 'ui';

import MapMarker from './components/map-marker';
import useGetLiveness from './hooks/use-get-liveness';
import mapStyles from './insight.styles';

const isBot = (userAgent: UAParser.IResult) =>
  userAgent.ua?.toLowerCase().includes('python');

const icoForUserAgent = (userAgent: UAParser.IResult) => {
  if (
    userAgent.os.name?.toLowerCase() === 'ios' ||
    userAgent.device.vendor?.toLowerCase() === 'apple'
  ) {
    return <IcoAppleColored24 />;
  }
  if (userAgent.os.name?.toLowerCase() === 'android') {
    return <IcoAndroidColored24 />;
  }
  if (userAgent.device.type?.toLowerCase() === 'mobile') {
    return <IcoPhone24 />;
  }
  if (isBot(userAgent)) {
    return <IcoCode24 />;
  }
  if (
    userAgent.os.name?.toLowerCase() === 'mac os' ||
    userAgent.os.name?.toLowerCase() === 'linux' ||
    userAgent.os.name?.toLowerCase() === 'windows' ||
    userAgent.device.type === undefined
  ) {
    return <IcoLaptop24 />;
  }
  return <IcoUser24 />;
};

const displayForUserAgent = (userAgent: UAParser.IResult) => {
  if (isBot(userAgent)) {
    return 'A robot';
  }
  const device = `${userAgent.device.vendor || ''} ${
    userAgent.device.model || ''
  }`.trim();
  const os = `${userAgent.os.name || ''} ${userAgent.os.version || ''}`.trim();
  if (device && os) {
    return `${device}, ${os}`;
  }
  return device || os || '-';
};

type InsightsProps = {
  user: User;
};

const Insights = ({ user }: InsightsProps) => {
  const getLiveness = useGetLiveness(user.footprintUserId);

  const biometricCred = getLiveness.data?.[0];

  // If there's a biometric credential, use the insight event from it since it will most likely be the mobile device.
  // If there's no biometric credential, use the insight event from the onboarding, which may be mobile or desktop.
  // We only show `Biometric: Verified` if the user has a biometric credential
  const insightEvent = biometricCred?.insightEvent || user.insightEvent;
  const userAgent = UAParser(insightEvent.userAgent || '');

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
      {getLiveness.isLoading ? (
        <Shimmer sx={{ height: '384px' }} />
      ) : (
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
