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

  const data = {
    tenantPk: 'ob_test_tFKxgkVoZrFTEU05tnSVtW',
    bootstrapData: {
      email: 'email',
      phoneNumber: 'phone',
    },
  };

  const layout = {
    header: {
      hideSandboxBanner: true,
    },
    footer: {
      hideFooter: true,
    },
    container: {
      hasBorderRadius: true,
    },
    canClose: false,
  };

  return (
    <Idv data={data} layout={layout} callbacks={{ onClose, onComplete }} />
  );
};

export default Root;
