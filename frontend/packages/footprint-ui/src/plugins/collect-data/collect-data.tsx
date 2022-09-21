import { CollectedDataOption } from 'types';

import { BasePluginProps } from '../base-plugin';

export type CollectDataContext = {
  mustCollectData: CollectedDataOption[];
};

export type CollectDataProps = BasePluginProps<CollectDataContext>;

const CollectData = () => {};
export default CollectData;
