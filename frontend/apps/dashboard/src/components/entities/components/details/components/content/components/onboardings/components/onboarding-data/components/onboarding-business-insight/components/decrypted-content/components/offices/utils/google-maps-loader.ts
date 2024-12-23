import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from 'src/config/constants';

const GoogleMapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'geocoding'],
});

export default GoogleMapsLoader;
