import React from 'react';

const withMachineProvider = (
  Provider: React.FC<{ children: React.ReactNode }>,
  Page: React.FC<{}>,
) => (
  <Provider>
    <Page />
  </Provider>
);

export default withMachineProvider;
