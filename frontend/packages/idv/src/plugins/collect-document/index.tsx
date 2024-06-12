import { DocumentRequestKind } from '@onefootprint/types';
import React, { useEffect } from 'react';

import { trackAction } from '../../utils/logger';
import IdDoc from './id-doc';
import NonIdDoc from './non-id-doc';
import type { IdDocProps } from './types';

const App = ({ idvContext, context, onDone }: IdDocProps) => {
  const { authToken, device } = idvContext;
  const { sandboxOutcome, obConfigSupportedCountries } = context;
  const { uploadMode, documentRequestId, config } = context.requirement;

  const initialContext = {
    authToken,
    device,
    orgId: context.orgId,
    documentRequestId,
    uploadMode,
    config,
  };

  const nonIdDocInitialContext = {
    ...initialContext,
    obConfigSupportedCountries,
  };
  const idDocInitialContext = { ...initialContext, sandboxOutcome };

  const handleFlowCompletion = () => {
    onDone();
    trackAction('id-doc:completed');
  };

  useEffect(() => {
    trackAction('id-doc:started');
  }, []);

  if (config.kind === DocumentRequestKind.Identity) {
    return (
      <IdDoc
        initialContext={{
          ...idDocInitialContext,
          config,
        }}
        onDone={handleFlowCompletion}
      />
    );
  }

  return <NonIdDoc initialContext={{ ...nonIdDocInitialContext }} onDone={handleFlowCompletion} />;
};

export default App;
