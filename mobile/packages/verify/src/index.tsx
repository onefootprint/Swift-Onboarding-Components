import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import React from 'react';

import EmailIdentification from './screens/email-identification';

const Sdk = () => {
  return (
    <DesignSystemProvider theme={themes.light}>
      <EmailIdentification />
    </DesignSystemProvider>
  );
};

export default Sdk;
