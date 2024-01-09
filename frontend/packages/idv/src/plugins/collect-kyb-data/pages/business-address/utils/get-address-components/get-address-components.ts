import { getDetails } from 'use-places-autocomplete';

const getValue = (
  key: string,
  addressComponent: google.maps.GeocoderAddressComponent[],
) => {
  const part = addressComponent.find(component =>
    component.types.includes(key),
  );
  return part ? part.long_name : null;
};

const getAddressComponent = async (
  prediction: google.maps.places.AutocompletePrediction,
) => {
  try {
    const result = await getDetails({ placeId: prediction.place_id });
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
