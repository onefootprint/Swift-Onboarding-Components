import GoogleMapReact from 'google-map-react';
import React from 'react';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';
import styled from 'styled-components';

import MapMarker from './components/map-marker';
import useOptions from './hooks/use-options';

// Middle of US
export const FALLBACK_LATITUDE = 37.09024;
export const FALLBACK_LONGITUDE = -95.712891;
export const GLOBE_LEVEL_ZOOM = 1;

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

  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  if (!markers.length) {
    return (
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
        defaultCenter={{
          lat: FALLBACK_LATITUDE,
          lng: FALLBACK_LONGITUDE,
        }}
        defaultZoom={GLOBE_LEVEL_ZOOM}
        options={options}
      />
    );
  }

  // Set the center of the map to be the average of all the markers
  const avgLat =
    markers.reduce((acc, marker) => acc + marker.lat, 0) / markers.length;
  const avgLng =
    markers.reduce((acc, marker) => acc + marker.lng, 0) / markers.length;
  const location = {
    lat: avgLat,
    lng: avgLng,
  };
  // Set the zoom level to include all markers when centered
  // Get the distance between the center and the furthest marker
  const maxDistance = Math.max(
    ...markers.map(marker =>
      Math.sqrt((marker.lat - avgLat) ** 2 + (marker.lng - avgLng) ** 2),
    ),
  );

  return (
    <Container>
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
        defaultCenter={location}
        defaultZoom={maxDistance * 1.5}
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
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export default Map;
