import { IcoBuilding24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import Field from '../field';
import Fieldset from '../fieldset';

const Address = () => {
  return (
    <Fieldset title="Address data" iconComponent={IcoBuilding24}>
      <Field di={IdDI.addressLine1} />
      <Field di={IdDI.addressLine2} />
      <Field di={IdDI.city} />
      <Field di={IdDI.state} />
      <Field di={IdDI.zip} />
      <Field di={IdDI.country} />
    </Fieldset>
  );
};

export default Address;
