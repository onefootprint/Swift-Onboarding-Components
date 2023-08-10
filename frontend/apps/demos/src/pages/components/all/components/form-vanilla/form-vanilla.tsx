import React from 'react';
import { COMPONENTS_AUTH_TOKEN } from 'src/config/constants';
import { useEffectOnce } from 'usehooks-ts';

const FormVanilla = () => {
  useEffectOnce(() => {
    if (!window) {
      return;
    }
    (window as any).footprintCallbacks = {
      onComplete: () => {
        console.log('complete');
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
      data-kind="form"
      data-variant="inline"
      data-props={JSON.stringify({ authToken: COMPONENTS_AUTH_TOKEN ?? '' })}
    />
  );
};

export default FormVanilla;
