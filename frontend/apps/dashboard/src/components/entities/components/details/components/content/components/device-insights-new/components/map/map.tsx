import GoogleMapReact from 'google-map-react';
import React, { useMemo } from 'react';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';
import styled from 'styled-components';

import MapMarker from './components/map-marker';
import useOptions from './hooks/use-options';

// Middle of US
export const FALLBACK_LATITUDE = 37.09024;
export const FALLBACK_LONGITUDE = -95.712891;
export const GLOBE_LEVEL_ZOOM = 1;
export const CITY_LEVEL_ZOOM = 13;

export type Marker = {
  lat: number;
  lng: number;
  isSelected?: boolean;
  icon: JSX.Element;
};

export type MapProps = {
  markers: Marker[];
};

const Map = ({ markers }: MapProps) => {
  const options = useOptions();

  const allLats = markers.map(marker => marker.lat);
  const allLngs = markers.map(marker => marker.lng);

  const { defaultCenter, defaultZoom } = useMemo(() => {
    if (!markers.length) {
      return {
        defaultCenter: {
          lat: FALLBACK_LATITUDE,
          lng: FALLBACK_LONGITUDE,
        },
        defaultZoom: GLOBE_LEVEL_ZOOM,
      };
    }

    // Set the center of the map to be the average of all the markers
    const avgLat =
      markers.reduce((acc, marker) => acc + marker.lat, 0) / markers.length;
    const avgLng =
      markers.reduce((acc, marker) => acc + marker.lng, 0) / markers.length;
    // Set the zoom level to include all markers when centered
    // Get the distance between the center and the furthest marker
    const maxDistance = Math.max(
      ...markers.map(marker =>
        Math.sqrt((marker.lat - avgLat) ** 2 + (marker.lng - avgLng) ** 2),
      ),
    );

    return {
      defaultCenter: {
        lat: avgLat,
        lng: avgLng,
      },
      defaultZoom:
        markers.length === 1 ? CITY_LEVEL_ZOOM : 1 / (maxDistance * 1.5),
    };
  }, [...allLats, ...allLngs]);

  return GOOGLE_MAPS_API_KEY ? (
    <Container>
      <GoogleMapReact
        key={`${defaultCenter.lat}-${defaultCenter.lng}`}
        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        options={options}
      >
        {markers.map(marker => (
          <MapMarker
            key={`${marker.lat}-${marker.lng}`}
            icon={marker.icon}
            lat={marker.lat}
            lng={marker.lng}
            isSelected={marker.isSelected}
          />
        ))}
      </GoogleMapReact>
    </Container>
  ) : null;
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  iframe + div {
    border: none !important;
  }
`;

export default Map;
