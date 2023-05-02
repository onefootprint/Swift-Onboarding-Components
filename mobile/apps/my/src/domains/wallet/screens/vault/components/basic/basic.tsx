import { IcoFileText216 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import Field from '../field';
import Fieldset from '../fieldset';

const Basic = () => {
  return (
    <Fieldset title="Basic data" iconComponent={IcoFileText216}>
      <Field di={IdDI.firstName} />
      <Field di={IdDI.lastName} />
      <Field di={IdDI.dob} />
    </Fieldset>
  );
};

export default Basic;
