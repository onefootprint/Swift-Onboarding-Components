import type React from 'react';

const withProvider = (Provider: React.FC<{ children: React.ReactNode }>, Component: React.FC<{}>) => (
  <Provider>
    <Component />
  </Provider>
);

export default withProvider;
