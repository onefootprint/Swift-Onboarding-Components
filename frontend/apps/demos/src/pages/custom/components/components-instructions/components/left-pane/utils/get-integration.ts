export const getReactIntegration =
  () => `import '@onefootprint/footprint-js/dist/footprint-js.css';
import './app.css';
import { appearance } from './config';
import { FootprintFormType } from '@onefootprint/footprint-js';
import { FootprintForm } from '@onefooprint/footprint-react';

const secretKey = process.env.FOOTPRINT_API_SECRET_KEY;

const PaymentForm = () => {
  
  const handleSave = () => {
    // TODO: Decrypt or proxy the saved data from your backend
  };

  return (
    <FootprintForm
      authToken="tok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit" // auth token generated using the Secret API Key on step 5
      type={FootprintFormType.cardAndZip}
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
        kind: 'secure-form',
        containerId: 'footprint-secure-form',
        props: {
          authToken: "tok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit", // auth token generated using the Secret API Key on step 5
          appearance: appearance, // appearance object from step 6
          title: "Add a New Card",
          type: "cardAndZip",
          variant: "drawer",
          onSave: handleSave,
          onClose: handleClose,
          onCancel: handleCancel
        }
      });
      component.render();
    },
    methods: {
      handleSave() {
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
  <div id="footprint-secure-form"/>
</template>
`;
