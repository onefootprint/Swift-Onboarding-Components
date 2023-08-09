import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import React from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyJsIntegration = () => {
  const launchVerify = (variant: 'modal' | 'drawer') => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      variant,
      publicKey,
    });
    component.render();
  };

  return (
    <>
      <Button onClick={() => launchVerify('modal')}>Modal</Button>
      <Button onClick={() => launchVerify('drawer')}>Drawer</Button>
    </>
  );
};

export default VerifyJsIntegration;
