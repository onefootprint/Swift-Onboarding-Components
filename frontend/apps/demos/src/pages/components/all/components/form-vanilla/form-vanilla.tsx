import React from 'react';
import { COMPONENTS_AUTH_TOKEN } from 'src/config/constants';

const FormVanilla = () => (
  <div
    data-footprint
    data-kind="form"
    data-variant="inline"
    data-props={JSON.stringify({ authToken: COMPONENTS_AUTH_TOKEN ?? '' })}
  />
);

export default FormVanilla;
