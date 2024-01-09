import {
  COUNTRIES_WITH_PROVINCES,
  COUNTRIES_WITH_STATES,
} from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { uniq } from 'lodash';
import { getDetails } from 'use-places-autocomplete';

const getComponent = (
  key: string,
  addressComponent: google.maps.GeocoderAddressComponent[],
) => {
  const part = addressComponent.find(component =>
    component.types.includes(key),
  );
  return part ?? undefined;
};

const getValue = (
  key: string,
  addressComponent: google.maps.GeocoderAddressComponent[],
) => getComponent(key, addressComponent)?.long_name;

const getCountryCode = (
  addressComponents: google.maps.GeocoderAddressComponent[],
) => {
  const country = getComponent('country', addressComponents);
  return (country?.short_name ?? 'US') as CountryCode;
};

export const getHasState = (country: CountryCode) =>
  COUNTRIES_WITH_STATES.includes(country) ||
  COUNTRIES_WITH_PROVINCES.includes(country);

const getState = (addressComponents: google.maps.GeocoderAddressComponent[]) =>
  getStateComponent(addressComponents)?.long_name ?? undefined;

const getStateComponent = (
  addressComponents: google.maps.GeocoderAddressComponent[],
) => {
  const country = getCountryCode(addressComponents);
  const hasState = getHasState(country);
  if (!hasState) {
    return undefined;
  }
  return getComponent('administrative_area_level_1', addressComponents);
};

const getCity = (addressComponents: google.maps.GeocoderAddressComponent[]) => {
  const countryCode = getCountryCode(addressComponents);
  const hasState = getHasState(countryCode);
  const cityLabels = hasState ? [] : ['administrative_area_level_1'];
  cityLabels.push('locality', 'administrative_area_level_2');
  const possibleCities = uniq(
    cityLabels
      .map(type => getValue(type, addressComponents))
      .filter(elem => !!elem),
  );
  return possibleCities[0];
};

const AddressLine1Types = [
  'street_address',
  'plus_code',
  'route',
  'intersection',
];

const getAddressLine1 = (
  mainText: string,
  addressComponents: google.maps.GeocoderAddressComponent[],
) => {
  const country = getCountryCode(addressComponents);
  if (country === 'US') {
    return mainText;
  }

  const hasState = getHasState(country);
  const state = hasState ? getState(addressComponents) : undefined;
  const city = getCity(addressComponents);

  // Don't repeat state or city & remove duplicates
  const addressList = uniq(
    AddressLine1Types.map(type => getValue(type, addressComponents)).filter(
      elem => !!elem && elem !== state && elem !== city,
    ),
  ) as string[];

  let addressString = mainText;
  addressList.forEach(elem => {
    if (addressString.indexOf(elem) === -1) {
      addressString = [addressString, elem].join(', ');
    }
  });

  return addressString;
};

const getAddressLine2 = (
  addressComponents: google.maps.GeocoderAddressComponent[],
) => {
  const country = getCountryCode(addressComponents);
  if (country === 'US') {
    return undefined;
  }
  return (
    getValue('neighborhood', addressComponents) ||
    getValue('sublocality', addressComponents)
  );
};

export const getAddressParts = (
  mainText: string,
  addressComponents: google.maps.GeocoderAddressComponent[],
) => ({
  addressLine1: getAddressLine1(mainText, addressComponents),
  addressLine2: getAddressLine2(addressComponents),
  city: getCity(addressComponents),
  state: getState(addressComponents),
  zip: getValue('postal_code', addressComponents),
});

export const getAddressComponent = async (
  prediction: google.maps.places.AutocompletePrediction,
) => {
  let addressComponents: google.maps.GeocoderAddressComponent[] = [];
  try {
    const result = await getDetails({ placeId: prediction.place_id });
    if (typeof result !== 'object' || !result.address_components) {
      return null;
    }
    addressComponents = result.address_components;
  } catch (_) {
    return null;
  }
  if (!addressComponents.length) {
    return null;
  }

  return getAddressParts(
    prediction.structured_formatting.main_text,
    addressComponents,
  );
};

export default getAddressComponent;
