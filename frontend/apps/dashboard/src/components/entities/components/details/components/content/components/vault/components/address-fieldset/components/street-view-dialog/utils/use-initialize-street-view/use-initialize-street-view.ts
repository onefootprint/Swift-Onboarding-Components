import { useQuery } from '@tanstack/react-query';
import GoogleMapsLoader from 'src/components/entities/utils/google-maps-loader';

const getCoordinatesFromAddress = async (address: string) => {
  await GoogleMapsLoader.importLibrary('geocoding');
  const geocoder = new google.maps.Geocoder();
  const result = await geocoder.geocode({ address });
  return {
    latitude: result.results[0].geometry.location.lat() || 0,
    longitude: result.results[0].geometry.location.lng() || 0,
  };
};

const useInitializeStreetView = (address: string) => {
  return useQuery({
    queryKey: ['coordinates', address],
    queryFn: () => getCoordinatesFromAddress(address),
    retry: false,
  });
};

export default useInitializeStreetView;
