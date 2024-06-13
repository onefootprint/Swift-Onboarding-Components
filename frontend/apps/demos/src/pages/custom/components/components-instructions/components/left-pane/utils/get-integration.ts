export const getReactIntegration = () => `import '@onefootprint/footprint-js/dist/footprint-js.css';
import './app.css';
import { appearance } from './config';
import { FootprintForm } from '@onefootprint/footprint-react';

const secretKey = process.env.FOOTPRINT_API_SECRET_KEY;

const PaymentForm = () => {
  
  const handleSave = () => {
    // TODO: Decrypt or proxy the saved data from your backend
  };

  return (
    <FootprintForm
      authToken="cttok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit" // auth token generated using the Secret API Key on step 5
      variant="modal"
      appearance={appearance} // appearance object from step 6
      onSave={onSave}
    />
  );
};

export default PaymentForm;`;

export const getVueIntegration = () => `
<script>
  import '@onefootprint/footprint-js/dist/footprint-js.css';
  import footprint from '@onefootprint/footprint-js';
  import { appearance } from './config';

  export default {
    mounted() {
      const component = footprint.init({
        kind: 'form',
        authToken: "cttok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit", // auth token generated using the Secret API Key on step 5
        appearance: appearance, // appearance object from step 6
        variant: "drawer",
        onComplete: handleComplete,
        onClose: handleClose,
        onCancel: handleCancel,
        getRef: ref => {
          // TODO: you can call a 'save()' method on 'ref' ('ref.save()') to save the form data; this is useful if you want to use your own save button
        },
        options: {
          hideFootprintLogo: false,
          hideButtons: false // hides the action buttons ('save' and 'cancel' buttons)
        }
      });
      component.render();
    },
    methods: {
      handleComplete() {
        // TODO: Decrypt or proxy the saved data from your backend
      },
      handleClose() {
        // TODO:
      },
      handleCancel() {
        // TODO:
      }
    }
  }
</script>

<template>
  <div id="my-page"/>
</template>
`;
