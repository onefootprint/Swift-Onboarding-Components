import GoogleMapReact from 'google-map-react';
import React from 'react';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';

import MapMarker from './components/map-marker';
import useOptions from './hooks/use-options';
import {
  CITY_LEVEL_ZOOM,
  FALLBACK_LATITUDE,
  FALLBACK_LONGITUDE,
  GLOBE_LEVEL_ZOOM,
} from './map.constants';

export type MapProps = {
  latitude: number | null;
  longitude: number | null;
};

const Map = ({ latitude, longitude }: MapProps) => {
  const options = useOptions();
  const hasLocation = latitude && longitude;
  const location = {
    lat: hasLocation ? latitude : FALLBACK_LATITUDE,
    lng: hasLocation ? longitude : FALLBACK_LONGITUDE,
  };
  const zoom = hasLocation ? CITY_LEVEL_ZOOM : GLOBE_LEVEL_ZOOM;

  return GOOGLE_MAPS_API_KEY ? (
    <GoogleMapReact
      bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
      defaultCenter={location}
      defaultZoom={zoom}
      options={options}
    >
      {hasLocation ? <MapMarker lat={location.lat} lng={location.lng} /> : null}
    </GoogleMapReact>
  ) : null;
};

export default Map;
