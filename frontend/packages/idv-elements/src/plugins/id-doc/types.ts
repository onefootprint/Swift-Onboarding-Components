import type { IdDocOutcomes, IdDocRequirement } from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type IdDocCustomData = {
  requirement: IdDocRequirement;
  sandboxOutcome?: IdDocOutcomes;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
