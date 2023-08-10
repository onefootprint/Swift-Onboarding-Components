import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyButtonVanilla = () => {
  useEffectOnce(() => {
    if (!window) {
      return;
    }
    (window as any).footprintCallbacks = {
      onComplete: (validationToken: string) => {
        console.log('complete ', validationToken);
      },
      onClose: () => {
        console.log('close');
      },
      onCancel: () => {
        console.log('cancel');
      },
    };
  });

  return (
    <div
      data-footprint
      data-kind="verify-button"
      data-props={JSON.stringify({
        publicKey,
      })}
    />
  );
};

export default VerifyButtonVanilla;
