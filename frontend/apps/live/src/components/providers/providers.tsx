import '@onefootprint/footprint-js/dist/footprint-js.css';

import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';

import React from 'react';

import configureReactI18next from '../../config/initializers/react-i18next';

configureReactI18next();

const Providers = ({ children }: React.PropsWithChildren) => (
  <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
);

export default Providers;
