import { IdDocRequirement } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

type IdDocCustomData = {
  requirement: IdDocRequirement;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;
