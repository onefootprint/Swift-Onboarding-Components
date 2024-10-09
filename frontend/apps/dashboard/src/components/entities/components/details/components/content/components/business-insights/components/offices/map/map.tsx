import 'mapbox-gl/dist/mapbox-gl.css';

import type { BusinessAddress } from '@onefootprint/types';
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

export type MapProps = {
  markers: JSX.Element[];
  selectedAddress?: BusinessAddress;
  onSelect: (id: string) => void;
};

const MapComponent = ({ markers, selectedAddress, onSelect }: MapProps) => {
  const mapRef = useRef<MapRef>(null);
  const theme = useTheme();
  const isDark = theme.theme === 'dark';
  const themeStyles = useStyledTheme();

  const handleMarkerClick = (markerProps: MapMarkerProps) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [markerProps.longitude, markerProps.latitude],
      zoom: DEFAULT_ZOOM,
    });
    onSelect(markerProps.id);
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedAddress?.longitude && selectedAddress?.latitude) {
      mapRef.current.flyTo({
        center: [selectedAddress.longitude, selectedAddress.latitude],
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
          bounds.extend(new google.maps.LatLng(marker.props.latitude, marker.props.longitude));
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
  }, [selectedAddress?.latitude, selectedAddress?.longitude, markers]);

  return (
    <Container>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={MAP_BOX_TOKEN}
        mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12'}
        style={{ width: '100%', height: '100%' }}
        initialViewState={
          selectedAddress?.latitude && selectedAddress?.longitude
            ? {
                latitude: selectedAddress.latitude,
                longitude: selectedAddress.longitude,
                zoom: DEFAULT_ZOOM,
              }
            : {
                latitude: FALLBACK_LATITUDE,
                longitude: FALLBACK_LONGITUDE,
                zoom: MIN_ZOOM,
              }
        }
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
      >
        {markers.map(marker => (
          <Marker
            key={marker.props.id}
            longitude={marker.props.longitude}
            latitude={marker.props.latitude}
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
