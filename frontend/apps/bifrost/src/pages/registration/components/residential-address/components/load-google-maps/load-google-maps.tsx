import Script from 'next/script';
import React from 'react';
import { GOOGLE_MAPS_KEY } from 'src/constants';

const LoadGoogleMaps = () => (
  <Script
    src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`}
    strategy="beforeInteractive"
  />
);

export default LoadGoogleMaps;
