import GoogleMap from 'google-maps-react-markers';
import React, { useEffect, useRef } from 'react';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';
import styled from 'styled-components';

import useOptions from './hooks/use-options';

// Middle of US
const FALLBACK_LATITUDE = 37.09024;
const FALLBACK_LONGITUDE = -95.712891;
const DEFAULT_ZOOM = 9;

type Coords = {
  lat: number;
  lng: number;
};

export type MapProps = {
  markers: JSX.Element[];
  selectedCoords?: Coords;
  onSelect: (id: string) => void;
};

type LoadedArgs = {
  map: MapRef;
};

type MapRef = {
  setCenter: (coords: Coords) => void;
};

const Map = ({ markers, selectedCoords, onSelect }: MapProps) => {
  const mapRef = useRef<MapRef | null>(null);

  const onGoogleApiLoaded = ({ map }: LoadedArgs) => {
    mapRef.current = map;
  };

  const onMarkerClick = (markerId: string, lat: number, lng: number) => {
    mapRef.current?.setCenter({ lat, lng });
    onSelect(markerId);
  };

  useEffect(() => {
    if (selectedCoords) {
      mapRef.current?.setCenter({
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
      });
    }
  }, [selectedCoords]);

  const options = useOptions();

  return GOOGLE_MAPS_API_KEY ? (
    <Container>
      <GoogleMap
        apiKey={GOOGLE_MAPS_API_KEY}
        onGoogleApiLoaded={onGoogleApiLoaded}
        defaultCenter={{
          lat: selectedCoords ? selectedCoords.lat : FALLBACK_LATITUDE,
          lng: selectedCoords ? selectedCoords.lng : FALLBACK_LONGITUDE,
        }}
        defaultZoom={DEFAULT_ZOOM}
        options={options}
        mapMinHeight="100%"
      >
        {markers.map(m =>
          React.cloneElement(m, {
            onClick: onMarkerClick,
          }),
        )}
      </GoogleMap>
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
