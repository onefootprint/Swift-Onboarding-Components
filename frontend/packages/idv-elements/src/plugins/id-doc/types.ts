import { IdDocOutcomes, IdDocRequirement } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type IdDocCustomData = {
  requirement: IdDocRequirement;
  sandboxOutcome?: IdDocOutcomes;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
