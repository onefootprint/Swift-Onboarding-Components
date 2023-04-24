import Idv from '@onefootprint/idv';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';

/*
  TODO: CONTENTS BELOW ARE PLACEHOLDERS ONLY
*/
const Root = () => {
  const onComplete = () => {
    console.log('completed');
  };

  return (
    <Idv
      data={{
        tenantPk: 'ob_test_tFKxgkVoZrFTEU05tnSVtW',
        userData: {
          [UserDataAttribute.email]: 'belce@onefootprint.com',
          [UserDataAttribute.phoneNumber]: '+16504600700',
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
      }}
      callbacks={{ onComplete }}
    />
  );
};

export default Root;
