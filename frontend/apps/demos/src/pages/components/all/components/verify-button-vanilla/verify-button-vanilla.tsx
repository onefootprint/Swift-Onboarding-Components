import React from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyButtonVanilla = () => (
  <div
    data-footprint
    data-kind="verify-button"
    data-props={JSON.stringify({
      publicKey,
    })}
  />
);

export default VerifyButtonVanilla;
