export const getReactIntegration = (
  cardAlias: string,
) => `import '@onefootprint/footprint-components-js/dist/footprint-components-js.css';
import './app.css';
import { appearance } from './config';
import { SecureFormType } from '@onefootprint/footprint-components-js';
import { FootprintSecureForm } from '@onefooprint/footprint-components-react';

const secretKey = process.env.FOOTPRINT_API_SECRET_KEY;

const PaymentForm = () => {
  
  const handleSave = () => {
    // TODO: Decrypt or proxy the saved data from your backend
  };

  return (
    <FootprintSecureForm
      authToken="tok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit" // auth token generated using the Secret API Key on step 5
      cardAlias={${cardAlias}} // this should match the cardAliases used while generating the auth token
      type={SecureFormType.cardAndZip}
      variant="modal"
      appearance={appearance} // appearance object from step 6
      onSave={onSave}
    />
  );
};

export default PaymentForm;`;

export const getVueIntegration = (cardAlias: string) => `
<script>
  import '@onefootprint/footprint-components-js/dist/footprint-components-js.css';
  import footprintComponent from '@onefootprint/footprint-components-js';
  import { appearance } from './config';

  export default {
    mounted() {
      footprintComponent.render({
        kind: 'secure-form',
        containerId: 'footprint-secure-form',
        props: {
          authToken: "tok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit", // auth token generated using the Secret API Key on step 5
          cardAlias: "${cardAlias}", // this should match the cardAliases used while generating the auth token
          appearance: appearance, // appearance object from step 6
          title: "Add a New Card",
          type: "cardAndZip",
          variant: "drawer",
          onSave: handleSave,
          onClose: handleClose,
          onCancel: handleCancel
        }
      })
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
