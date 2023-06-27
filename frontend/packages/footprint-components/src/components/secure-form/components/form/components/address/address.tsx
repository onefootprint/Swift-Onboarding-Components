import { CountrySelectOption, Grid, SelectOption } from '@onefootprint/ui';
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
  const country = watch('country');

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
      <AddressLines countryCode={country.value} />
      <Grid.Row>
        <Grid.Column col={6}>
          <CityField />
        </Grid.Column>
        <Grid.Column col={6}>
          <ZipField countryCode={country.value} />
        </Grid.Column>
      </Grid.Row>
      <StateField inputKind={country.value === 'US' ? 'dropdown' : 'text'} />
    </>
  );
};

export default Address;
