import { CollectedKycDataOption } from '@onefootprint/types';

import { BasePluginProps } from '../base-plugin';

export type CollectKycDataContext = {
  missingAttributes: readonly CollectedKycDataOption[];
  userFound: boolean;
};

export type CollectKycDataProps = BasePluginProps<CollectKycDataContext>;
