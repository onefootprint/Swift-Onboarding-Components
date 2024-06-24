import '@onefootprint/footprint-js/dist/footprint-js.css';

import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { FootprintButton } from '@onefootprint/footprint-react';
import React from 'react';

type DemoReactProps = {
  kind: 'auth' | 'verify';
};

const DemoReact = ({ kind }: DemoReactProps) => {
  if (kind === 'auth') {
    return (
      <FootprintButton
        kind={FootprintComponentKind.Auth}
        publicKey="pb_test_7TdzxpZoqUpzPuvfgncUtu"
        onComplete={console.log}
      />
    );
  }
  if (kind === 'verify') {
    return (
      <FootprintButton
        kind={FootprintComponentKind.Verify}
        publicKey="pb_test_LRfe5D3dZnWSf5vOGSeCFk"
        onComplete={console.log}
      />
    );
  }
  return null;
};

export default DemoReact;
