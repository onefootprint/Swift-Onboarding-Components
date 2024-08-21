import { DocumentRequestKind, type DocumentRequirement, type IdDocRequirementConfig } from '@onefootprint/types';
import { useEffect } from 'react';

import { trackAction } from '../../utils/logger';
import IdDoc from './id-doc';
import NonIdDoc from './non-id-doc';
import type { IdDocProps } from './types';

const CollectDocument = ({ idvContext, context, onDone }: IdDocProps) => {
  const { authToken, device } = idvContext;
  const { requirement, sandboxOutcome } = context;

  const initialContext = {
    authToken,
    device,
    orgId: context.orgId,
  };

  const handleFlowCompletion = () => {
    onDone();
    trackAction('id-doc:completed', { kind: requirement.config.kind });
  };

  useEffect(() => {
    trackAction('id-doc:started', { kind: requirement.config.kind });
  }, []);

  if (isIdDocRequirement(requirement)) {
    return (
      <IdDoc
        initialContext={{
          ...initialContext,
          sandboxOutcome,
          requirement,
        }}
        onDone={handleFlowCompletion}
      />
    );
  }

  return (
    <NonIdDoc
      initialContext={{
        ...initialContext,
        requirement,
      }}
      onDone={handleFlowCompletion}
    />
  );
};

const isIdDocRequirement = (
  requirement: DocumentRequirement,
): requirement is DocumentRequirement<IdDocRequirementConfig> =>
  requirement.config.kind === DocumentRequestKind.Identity;

export default CollectDocument;
