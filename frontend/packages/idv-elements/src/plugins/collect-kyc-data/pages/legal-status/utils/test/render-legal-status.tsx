import { customRender } from '@onefootprint/test-utils';
import React from 'react';
import { KycData } from 'src/plugins/collect-kyc-data/utils';
import { MachineContext } from 'src/plugins/collect-kyc-data/utils/state-machine';

import TestWrapper from '../../../../utils/test-wrapper/test-wrapper';
import LegalStatus from '../../legal-status';

export const renderLegalStatus = (
  initialContext: MachineContext,
  onComplete?: (args: KycData) => void,
) => {
  const legalStatusComponent = <LegalStatus onComplete={onComplete} />;
  customRender(TestWrapper(initialContext, 'confirm', legalStatusComponent));
};

export * from '@onefootprint/test-utils';
