import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { CountrySelectOption, Grid } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import CountryField from '../country-field';
import ZipField from '../zip-field';

export type AddressData = {
  country: CountrySelectOption;
  zip: string;
};

const PartialAddress = () => {
  const methods = useFormContext<AddressData>();
  const { watch, resetField } = methods;
  const country = watch('country');

  const handleCountryChange = () => {
    resetField('zip');
  };

  return (
    <Grid.Row>
      <Grid.Column col={6}>
        <CountryField onChange={handleCountryChange} />
      </Grid.Column>
      <Grid.Column col={6}>
        <ZipField countryCode={country.value ?? DEFAULT_COUNTRY.value} />
      </Grid.Column>
    </Grid.Row>
  );
};

export default PartialAddress;
