import { IcoUserCircle24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import Field from '../field';
import Fieldset from '../fieldset';

const Identity = () => {
  return (
    <Fieldset title="Identity" iconComponent={IcoUserCircle24}>
      <Field di={IdDI.ssn9} />
    </Fieldset>
  );
};

export default Identity;
