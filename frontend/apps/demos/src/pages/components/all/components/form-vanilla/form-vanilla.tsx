import { useEffectOnce } from 'usehooks-ts';

import { DEMO_FORM_AUTH_TOKEN } from '../../../../../config/constants';

const FormVanilla = () => {
  useEffectOnce(() => {
    if (!window) {
      return;
    }
    // @ts-expect-error: footprintCallbacks is custom
    window.footprintCallbacks = {
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
      data-props={JSON.stringify({ authToken: DEMO_FORM_AUTH_TOKEN ?? '' })}
    />
  );
};

export default FormVanilla;
