import { IcoPin16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';
import { type MapRef, Map as MapboxMap } from 'react-map-gl';
import styled, { css } from 'styled-components';
import type { GeolocationEventProps } from '../../kyc.types';

const PUBLIC_MAP_BOX_TOKEN = process.env.MAPBOX_TOKEN;

const GeolocationEvent = ({
  latitude,
  longitude,
  city,
  country_name,
  createdAt,
  ip,
  version,
}: GeolocationEventProps) => {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter([longitude, latitude]);
      mapRef.current.setZoom(11);
    }
  }, [latitude, longitude]);

  return (
    <Stack padding={3} gap={2} direction="column" justify="space-between" width="100%">
      <Stack gap={2} direction="row" justify="space-between" width="100%">
        <Text variant="snippet-2" color="tertiary">
          {createdAt && format(new Date(createdAt), 'HH:mm:ss')}
        </Text>
        <Stack gap={2} direction="row" align="center">
          <IcoPin16 color="secondary" />
          <Text variant="snippet-2" color="secondary">
            Geolocation
          </Text>
        </Stack>
      </Stack>
      <Stack gap={2} direction="row" justify="space-between" width="100%">
        <Text variant="snippet-2" color="tertiary">
          IP: {ip}
        </Text>
        <Text variant="snippet-2" color="tertiary">
          Version: {version}
        </Text>
      </Stack>
      <Stack gap={2} direction="row" justify="space-between" width="100%">
        <Text variant="snippet-2" color="tertiary">
          City: {city}
        </Text>
        <Text variant="snippet-2" color="tertiary">
          Country: {country_name}
        </Text>
      </Stack>
      <MapContainer>
        <MapboxMap
          ref={mapRef}
          mapboxAccessToken={PUBLIC_MAP_BOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v10"
          style={{ width: '100%', height: '100%' }}
          initialViewState={{
            latitude,
            longitude,
            zoom: 11,
          }}
          maxZoom={20}
          minZoom={1}
          attributionControl={false}
        />
      </MapContainer>
    </Stack>
  );
};

const MapContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 200px;
    margin-top: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

export default GeolocationEvent;
