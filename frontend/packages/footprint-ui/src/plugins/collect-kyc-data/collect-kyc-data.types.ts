import { CollectedDataOption } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  missingAttributes: CollectedDataOption[];
  userFound: boolean;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;
