import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import React from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyReactIntegration = () => (
  <>
    <FootprintVerifyButton
      label="Verify with Footprint (modal)"
      publicKey={publicKey}
    />
    <FootprintVerifyButton
      label="Verify with Footprint (drawer)"
      publicKey={publicKey}
      dialogVariant="drawer"
    />
  </>
);

export default VerifyReactIntegration;
