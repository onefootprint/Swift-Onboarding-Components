import 'mapbox-gl/dist/mapbox-gl.css';

import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';
import type { MapRef } from 'react-map-gl';
import { Map as MapboxMap, Marker } from 'react-map-gl';
import { MAP_BOX_TOKEN } from 'src/config/constants';
import styled, { useTheme as useStyledTheme } from 'styled-components';

import GoogleMapsLoader from '../content/utils/google-maps-loader';
import type { MapMarkerProps } from './components/map-marker';

const DEFAULT_ZOOM = 11;
const MAX_ZOOM = 20;
const MIN_ZOOM = 1;
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

const MapComponent = ({ markers, selectedCoords, onSelect }: MapProps) => {
  const mapRef = useRef<MapRef>(null);
  const theme = useTheme();
  const isDark = theme.theme === 'dark';
  const themeStyles = useStyledTheme();

  const handleMarkerClick = (markerProps: MapMarkerProps) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [markerProps.lng, markerProps.lat],
      zoom: DEFAULT_ZOOM,
    });
    onSelect(markerProps.id);
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedCoords) {
      mapRef.current.flyTo({
        center: [selectedCoords.lng, selectedCoords.lat],
        zoom: DEFAULT_ZOOM,
      });
    } else if (!markers.length) {
      mapRef.current.flyTo({
        center: [FALLBACK_LONGITUDE, FALLBACK_LATITUDE],
        zoom: MIN_ZOOM,
      });
    } else {
      GoogleMapsLoader.importLibrary('core').then(() => {
        // Find the midpoint of all markers and zoom out to see all markers
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => {
          bounds.extend(new google.maps.LatLng(marker.props.lat, marker.props.lng));
        });
        const center = bounds.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        if (!mapRef.current) return;
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: MIN_ZOOM,
        });
      });
    }
  }, [selectedCoords, markers]);

  return (
    <Container>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={MAP_BOX_TOKEN}
        mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'}
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
            anchor="bottom"
            style={marker.props.isSelected ? { zIndex: themeStyles.zIndex.popover } : { zIndex: 0 }}
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

export default MapComponent;
