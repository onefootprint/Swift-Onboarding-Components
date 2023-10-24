import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountrySelectOption, SelectOption } from '@onefootprint/ui';
import { Grid } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import AddressLines from './components/address-lines';
import CityField from './components/city-field';
import CountryField from './components/country-field';
import StateField from './components/state-field';
import ZipField from './components/zip-field';

export type AddressData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string | SelectOption;
  country: CountrySelectOption;
  zip: string;
};

const Address = () => {
  const methods = useFormContext<AddressData>();
  const { watch, setFocus, resetField } = methods;
  const country = watch('country') ?? DEFAULT_COUNTRY;
  const countryValue = country.value;

  const handleCountryChange = () => {
    setFocus('addressLine1');
    resetField('addressLine1');
    resetField('addressLine2');
    resetField('city');
    resetField('state');
    resetField('zip');
  };

  return (
    <>
      <CountryField onChange={handleCountryChange} />
      <AddressLines countryCode={countryValue} />
      <Grid.Container>
        <CityField />
        <ZipField countryCode={countryValue} />
      </Grid.Container>
      <StateField inputKind={countryValue === 'US' ? 'dropdown' : 'text'} />
    </>
  );
};

export default Address;
