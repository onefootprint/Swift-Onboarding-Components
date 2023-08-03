import React from 'react';

const authToken = 'tok_SkgpMYfPAqkl3AaLrtsQsfNxKqxbWF88LN'; // process.env.NEXT_PUBLIC_COMPONENTS_AUTH_TOKEN as string;

const FormVanilla = () => (
  <div
    data-footprint
    data-kind="form"
    data-variant="inline"
    data-props={JSON.stringify({ authToken })}
  />
);

export default FormVanilla;
