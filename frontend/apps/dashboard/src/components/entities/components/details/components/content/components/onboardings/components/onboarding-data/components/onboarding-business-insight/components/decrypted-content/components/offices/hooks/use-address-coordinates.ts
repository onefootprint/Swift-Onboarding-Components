import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormattedAddress } from '../../../../../onboarding-business-insight.types';
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

const useAddressCoordinates = ({
  id,
  addressLine1,
  city,
  state,
  postalCode,
  latitude,
  longitude,
}: FormattedAddress) => {
  const queryClient = useQueryClient();

  const hasCoordinates = Boolean(latitude) && Boolean(longitude);
  const addressFields = [addressLine1, city, state, postalCode];
  const enabled = hasCoordinates || addressFields.every(field => Boolean(field));
  const completeAddress = addressFields.join(', ');

  const query = useQuery({
    queryKey: ['onboardings', 'offices', id],
    queryFn: async () =>
      hasCoordinates ? { latitude, longitude } : await getAddressCoordinates(queryClient, id, completeAddress),
    enabled,
  });

  return {
    ...query,
    isPending: query.isPending && query.fetchStatus !== 'idle',
  };
};

export default useAddressCoordinates;
