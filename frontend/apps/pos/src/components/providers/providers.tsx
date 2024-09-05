import themes from '@onefootprint/design-tokens';
import { Fp } from '@onefootprint/footprint-react';
import { DesignSystemProvider } from '@onefootprint/ui';
import { QueryClientProvider } from '@tanstack/react-query';

import type React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';
import configureReactQuery from '../../config/initializers/react-query';

configureReactI18next();
const queryClient = configureReactQuery();

const App = ({ children }: React.PropsWithChildren) => (
  <Fp.Provider publicKey="pb_test_Ly508VDujEz1kQPrkwSyHu">
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={themes.avis}>{children}</DesignSystemProvider>
    </QueryClientProvider>
  </Fp.Provider>
);

export default App;
