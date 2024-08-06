import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { IdDI } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const VerifyJsIntegration = () => {
  const launchDrawer = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      variant: 'drawer',
      publicKey,
      bootstrapData: {
        [IdDI.email]: 'jappleseed@onefootprint.com',
        [IdDI.phoneNumber]: '+15555550100',
        [IdDI.firstName]: 'Johnny',
        [IdDI.lastName]: 'Appleseed',
      },
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
  };

  const launchModal = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Verify,
      variant: 'modal',
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
  };

  return (
    <>
      <Button onClick={launchModal}>Modal</Button>
      <Button onClick={launchDrawer}>Drawer</Button>
    </>
  );
};

export default VerifyJsIntegration;
