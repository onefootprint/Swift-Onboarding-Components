import { CollectedDataOption } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectDataContext = {
  mustCollectData: CollectedDataOption[];
};

export type CollectDataProps = BasePluginProps<CollectDataContext>;
