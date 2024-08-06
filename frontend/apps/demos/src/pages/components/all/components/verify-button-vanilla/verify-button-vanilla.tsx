import { useEffectOnce } from 'usehooks-ts';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyButtonVanilla = () => {
  useEffectOnce(() => {
    if (!window) {
      return;
    }
    // @ts-expect-error: footprintCallbacks is custom
    window.footprintCallbacks = {
      onComplete: (validationToken: string) => {
        // TODO: User has finished the flow. This validation token can be used to see the fp_id of
        // the user, the auth method they used to log in, and their KYC status
        console.log('complete ', validationToken);
      },
      onAuth: (validationToken: string) => {
        // User has authenticated. This validation token can optionally be used to see the fp_id
        // of the authenticated user and the auth method they used to log in
        console.log(validationToken);
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
