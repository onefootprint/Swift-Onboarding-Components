import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useEffect } from 'react';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyButtonJsIntegration = () => {
  useEffect(() => {
    const component = footprint.init({
      kind: FootprintComponentKind.VerifyButton,
      variant: 'inline',
      containerId: 'verify-button-js',
      publicKey,
      onComplete: (validationToken: string) => {
        console.log('complete ', validationToken);
      },
      onClose: () => {
        console.log('close');
      },
      onCancel: () => {
        console.log('cancel');
      },
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, []);

  return <div id="verify-button-js" />;
};

export default VerifyButtonJsIntegration;
