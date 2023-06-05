import { IdDocRequirement } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type IdDocCustomData = {
  requirement: IdDocRequirement;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
