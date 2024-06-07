import { getDetails } from 'use-places-autocomplete';

import { getAutoCompleteCity } from '../../../../../../utils';

const getLongName = (key: string, addressComponent: google.maps.GeocoderAddressComponent[]) => {
  const part = addressComponent.find(c => c.types.includes(key));
  return part ? part.long_name : null;
};

const getAddressComponent = async (prediction: google.maps.places.AutocompletePrediction) => {
  try {
    const result = await getDetails({ placeId: prediction.place_id });
    if (typeof result === 'object' && result.address_components) {
      const addressComponents = result.address_components;

      return {
        city: getAutoCompleteCity(addressComponents, prediction?.structured_formatting?.secondary_text),
        state: getLongName('administrative_area_level_1', addressComponents),
        zip: getLongName('postal_code', addressComponents),
      };
    }
  } catch (_) {
    // do nothing
  }
  return null;
};

export default getAddressComponent;
