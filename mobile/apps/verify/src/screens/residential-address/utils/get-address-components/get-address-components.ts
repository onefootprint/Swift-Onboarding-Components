import type { AddressGeocoder } from '@onefootprint/ui';
import { getGoogleMapsAddressDetails } from '@onefootprint/ui';

const getValue = (key: string, addressComponent: AddressGeocoder[]) => {
  const part = addressComponent.find(component =>
    component.types.includes(key),
  );
  return part ? part.long_name : null;
};

const getAddressComponent = async (
  placeId: string,
  lang?: 'spanish' | 'english',
) => {
  try {
    const result = await getGoogleMapsAddressDetails(placeId, lang);
    if (typeof result === 'object' && result.address_components) {
      const addressComponents = result.address_components;
      return {
        city:
          getValue('locality', addressComponents) ||
          getValue('administrative_area_level_2', addressComponents),
        state: getValue('administrative_area_level_1', addressComponents),
        zip: getValue('postal_code', addressComponents),
      };
    }
  } catch (_) {
    // do nothing
  }
  return null;
};

export default getAddressComponent;
