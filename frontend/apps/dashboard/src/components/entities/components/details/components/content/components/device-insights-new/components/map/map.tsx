import 'mapbox-gl/dist/mapbox-gl.css';

import React, { useEffect, useRef } from 'react';
import { type MapRef } from 'react-map-gl';
import { Map as MapboxMap, Marker } from 'react-map-gl';
import styled from 'styled-components';

import type { MapMarkerProps } from './components/map-marker';

const PUBLIC_MAP_BOX_TOKEN =
  'pk.eyJ1IjoiYmVsY2VvbmVmb290cHJpbnQiLCJhIjoiY2x2empoY2EwMDA5aDJrcGg0Y3RkOTBreiJ9.2TyaEVdUljarrNN4XXoeUA';

const DEFAULT_ZOOM = 9;
const MAX_ZOOM = 20;
const MIN_ZOOM = 3;
// Middle of US
const FALLBACK_LATITUDE = 37.09024;
const FALLBACK_LONGITUDE = -95.712891;

type Coords = {
  lat: number;
  lng: number;
};

export type MapProps = {
  markers: JSX.Element[];
  selectedCoords?: Coords;
  onSelect: (id: string) => void;
};

const Map = ({ markers, selectedCoords, onSelect }: MapProps) => {
  const mapRef = useRef<MapRef>(null);

  const handleMarkerClick = (markerProps: MapMarkerProps) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [markerProps.lng, markerProps.lat],
      zoom: DEFAULT_ZOOM,
    });
    onSelect(markerProps.id);
  };

  useEffect(() => {
    if (!mapRef.current || !selectedCoords) return;
    mapRef.current.flyTo({
      center: [selectedCoords.lng, selectedCoords.lat],
      zoom: DEFAULT_ZOOM,
    });
  }, [selectedCoords]);

  return (
    <Container>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={PUBLIC_MAP_BOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          latitude: selectedCoords ? selectedCoords.lat : FALLBACK_LATITUDE,
          longitude: selectedCoords ? selectedCoords.lng : FALLBACK_LONGITUDE,
          zoom: selectedCoords ? DEFAULT_ZOOM : MIN_ZOOM,
        }}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
      >
        {markers.map(marker => (
          <Marker
            key={marker.props.id}
            longitude={marker.props.lng}
            latitude={marker.props.lat}
          >
            {React.cloneElement(marker, {
              onClick: () => handleMarkerClick(marker.props),
            })}
          </Marker>
        ))}
      </MapboxMap>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

export default Map;
