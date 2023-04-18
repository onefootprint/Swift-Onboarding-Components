import Idv from '@onefootprint/idv';
import React from 'react';

/*
  TODO: CONTENTS BELOW ARE PLACEHOLDERS ONLY
*/
const Root = () => {
  const onClose = () => {
    console.log('closed');
  };

  const onComplete = () => {
    console.log('completed');
  };

  return (
    <Idv
      data={{
        tenantPk: 'ob_test_tFKxgkVoZrFTEU05tnSVtW',
        bootstrapData: {
          email: 'belce@onefootprint.com',
          phoneNumber: '+16504600700',
        },
      }}
      layout={{
        header: {
          hideDesktopSandboxBanner: true,
        },
        footer: {
          hideDesktopFooter: true,
        },
        container: {
          hasBorderRadius: true,
        },
        canClose: false,
      }}
      callbacks={{ onClose, onComplete }}
    />
  );
};

export default Root;
