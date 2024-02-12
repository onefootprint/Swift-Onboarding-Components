import {
  COUNTRIES_WITH_PROVINCES,
  COUNTRIES_WITH_STATES,
} from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { uniq } from 'lodash';
import { getDetails } from 'use-places-autocomplete';

type AddressComponent = google.maps.GeocoderAddressComponent;
type Prediction = google.maps.places.AutocompletePrediction;

const AddressLine1Types = [
  'street_address',
  'plus_code',
  'route',
  'intersection',
];

const getHasStateOrProvince = (country: CountryCode) =>
  COUNTRIES_WITH_STATES.includes(country) ||
  COUNTRIES_WITH_PROVINCES.includes(country);

const getComponent = (key: string, addressComponent: AddressComponent[]) => {
  const part = addressComponent.find(c => c.types.includes(key));
  return part ?? undefined;
};

const getLongName = (key: string, addressComponent: AddressComponent[]) =>
  getComponent(key, addressComponent)?.long_name;

const getCountryCode = (addressComponents: AddressComponent[]) => {
  const country = getComponent('country', addressComponents);
  return (country?.short_name ?? 'US') as CountryCode;
};

const getStateLongName = (addressComponents: AddressComponent[]) =>
  getStateComponent(addressComponents)?.long_name ?? undefined;

const getStateComponent = (addressComponents: AddressComponent[]) => {
  const country = getCountryCode(addressComponents);
  const hasStateOrProvince = getHasStateOrProvince(country);
  return !hasStateOrProvince
    ? undefined
    : getComponent('administrative_area_level_1', addressComponents);
};

const getLongNamesByKeys = (
  [key, ...keys]: string[],
  list: AddressComponent[],
  acc: string[] = [],
): string[] => {
  if (!Array.isArray(list) || list.length === 0) return acc;
  if (!key) return acc;

  const item = list.find(c => c.types.includes(key));
  if (item && item.long_name && !acc.includes(item.long_name)) {
    acc.push(item.long_name);
  }

  return Array.isArray(keys) && keys.length > 0
    ? getLongNamesByKeys(keys, list, acc)
    : acc;
};

export const getAutoCompleteCity = (
  addressComponents: AddressComponent[],
  secondaryText?: string,
) => {
  const countryCode = getCountryCode(addressComponents);
  const hasStateOrProvince = getHasStateOrProvince(countryCode);
  const locality: string | undefined = hasStateOrProvince
    ? getLongName('locality', addressComponents) ||
      getLongName('administrative_area_level_2', addressComponents)
    : getLongName('administrative_area_level_1', addressComponents) ||
      getLongName('locality', addressComponents) ||
      getLongName('administrative_area_level_2', addressComponents);

  const sublocalities = getLongNamesByKeys(
    [
      'sublocality',
      'sublocality_level_1',
      'sublocality_level_2',
      'sublocality_level_3',
      'sublocality_level_4',
    ],
    addressComponents,
  );

  const localityFromSecondaryText = secondaryText
    ? [locality, ...sublocalities].find(s => s && secondaryText.includes(s))
    : undefined;

  return localityFromSecondaryText || locality || sublocalities.pop();
};

const getAddressLine1 = (
  mainText: string,
  addressComponents: AddressComponent[],
) => {
  const country = getCountryCode(addressComponents);
  if (country === 'US') {
    return mainText;
  }

  const hasState = getHasStateOrProvince(country);
  const state = hasState ? getStateLongName(addressComponents) : undefined;
  const city = getAutoCompleteCity(addressComponents);

  // Don't repeat state or city & remove duplicates
  const addressList = uniq(
    AddressLine1Types.map(type => getLongName(type, addressComponents)).filter(
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

const getAddressLine2 = (addressComponents: AddressComponent[]) => {
  const country = getCountryCode(addressComponents);
  if (country === 'US') {
    return undefined;
  }
  return (
    getLongName('neighborhood', addressComponents) ||
    getLongName('sublocality', addressComponents)
  );
};

export const getAddressParts = (
  mainText: string,
  addressComponents: AddressComponent[],
  secondaryText?: string,
) => ({
  addressLine1: getAddressLine1(mainText, addressComponents),
  addressLine2: getAddressLine2(addressComponents),
  city: getAutoCompleteCity(addressComponents, secondaryText),
  state: getStateLongName(addressComponents),
  zip: getLongName('postal_code', addressComponents),
});

export const getAddressComponent = async (prediction: Prediction) => {
  let addressComponents: AddressComponent[] = [];
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
    prediction.structured_formatting.secondary_text,
  );
};

export default getAddressComponent;
