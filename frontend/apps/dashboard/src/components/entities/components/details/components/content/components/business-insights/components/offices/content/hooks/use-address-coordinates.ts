import type { BusinessAddress } from '@onefootprint/types';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GoogleMapsLoader from '../utils/google-maps-loader';

type Coordinates = {
  latitude: number | undefined;
  longitude: number | undefined;
};

const getCoordinatesFromAddress = async (addressStr: string): Promise<Coordinates | undefined> => {
  try {
    await GoogleMapsLoader.importLibrary('geocoding');
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address: addressStr });
    return {
      latitude: result.results[0].geometry.location.lat(),
      longitude: result.results[0].geometry.location.lng(),
    };
  } catch (_e) {
    return undefined;
  }
};

const getAddressCoordinates = async (queryClient: QueryClient, addressEntryId: string, addressStr: string) => {
  const getFromCache = () => queryClient.getQueryData<Coordinates>(['business-insights', addressEntryId]);

  const createInitialData = async (): Promise<Coordinates> => {
    const coordinates = await getCoordinatesFromAddress(addressStr);
    return { latitude: coordinates?.latitude, longitude: coordinates?.longitude };
  };

  const possibleData = getFromCache();
  if (possibleData) return possibleData;
  const initialData = await createInitialData();
  return initialData;
};

const useAddressCoordinates = (address: BusinessAddress) => {
  const queryClient = useQueryClient();

  const addressFields = [address.addressLine1, address.city, address.state, address.postalCode];
  const enabled = (!!address.latitude && !!address.longitude) || addressFields.every(field => !!field);
  const completeAddress = addressFields.join(', ');

  const query = useQuery({
    queryKey: ['business-insights', address.id],
    queryFn: () =>
      !!address.latitude && !!address.longitude
        ? { latitude: address.latitude, longitude: address.longitude }
        : getAddressCoordinates(queryClient, address.id, completeAddress),
    enabled,
  });

  return {
    ...query,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
  };
};

export default useAddressCoordinates;
