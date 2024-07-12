import { FootprintButton } from '@onefootprint/footprint-react';
import React from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyButtonReactIntegration = () => (
  <>
    <FootprintButton
      kind="verify"
      label="Verify with Footprint (modal)"
      publicKey={publicKey}
      onComplete={(validationToken: string) => console.log('complete ', validationToken)}
      onClose={() => console.log('close')}
      onCancel={() => console.log('cancel')}
    />
    <FootprintButton
      kind="verify"
      label="Verify with Footprint (drawer)"
      publicKey={publicKey}
      dialogVariant="drawer"
      onComplete={(validationToken: string) => console.log('complete ', validationToken)}
      onClose={() => console.log('close')}
      onCancel={() => console.log('cancel')}
    />
  </>
);

export default VerifyButtonReactIntegration;
