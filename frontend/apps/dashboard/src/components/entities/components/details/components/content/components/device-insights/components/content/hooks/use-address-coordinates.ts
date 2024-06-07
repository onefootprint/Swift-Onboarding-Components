import type { Entity } from '@onefootprint/types';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import AddressType from '../components/address-card/types';
import GoogleMapsLoader from '../utils/google-maps-loader';
import useAddressFieldsProps from './use-address-fields-props';

type Coordinates = {
  lat: number | undefined;
  lng: number | undefined;
};

const getCoordinatesFromAddress = async (address: string): Promise<Coordinates | undefined> => {
  try {
    await GoogleMapsLoader.importLibrary('geocoding');
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address });
    return {
      lat: result.results[0].geometry.location.lat(),
      lng: result.results[0].geometry.location.lng(),
    };
  } catch (_e) {
    return undefined;
  }
};

const getAddressCoordinates = async (queryClient: QueryClient, entity: Entity, type: AddressType, address: string) => {
  const getFromCache = () => queryClient.getQueryData<Coordinates>(['device-insights', entity.id, type]);

  const createInitialData = async (): Promise<Coordinates> => {
    const coordinates = await getCoordinatesFromAddress(address);
    return { lat: coordinates?.lat, lng: coordinates?.lng };
  };

  const possibleData = getFromCache();
  if (possibleData) return possibleData;
  const initialData = await createInitialData();
  return initialData;
};

const useAddressCoordinates = (entity: Entity, type: AddressType) => {
  const queryClient = useQueryClient();
  const { getAddressFieldsProps } = useAddressFieldsProps(entity);
  const update = (newData: Coordinates) => {
    const prevData = queryClient.getQueryData<Coordinates>(['device-insights', entity.id, type]);
    queryClient.setQueryData(['device-insights', entity.id, type], {
      ...prevData,
      lat: newData.lat,
      lng: newData.lng,
    });
  };

  const addressProps = getAddressFieldsProps(type);
  const decryptableSet = new Set(entity.decryptableAttributes);
  const encryptedFields = addressProps.filter(prop => !prop.isDecrypted);
  const decryptableFields = encryptedFields.filter(
    field => !field || (decryptableSet.has(field.name) && field.canDecrypt),
  );
  const hasCompleteAddress = addressProps.length > 0 && decryptableFields.length === 0;
  const completeAddress = addressProps
    .map(prop => prop.value)
    .filter(v => !!v)
    .join(', ');
  const addressTypeRequired = entity.kind === 'business' ? AddressType.business : AddressType.residential;
  const enabled = !!entity && type === addressTypeRequired && hasCompleteAddress && !!completeAddress;

  const query = useQuery<Coordinates>(
    ['device-insights', entity.id, type],
    () => getAddressCoordinates(queryClient, entity, type, completeAddress),
    {
      enabled,
    },
  );

  return {
    ...query,
    update,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
  };
};

export default useAddressCoordinates;
