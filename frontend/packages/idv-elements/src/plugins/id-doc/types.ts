import type { IdDocOutcomes, IdDocRequirement } from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type IdDocCustomData = {
  requirement: IdDocRequirement;
  sandboxOutcome?: IdDocOutcomes;
};

export type IdDocProps = BasePluginProps<IdDocCustomData>;

type Heic2any = {
  blob: Blob;
  multiple?: true | undefined;
  toType?: string | undefined;
  quality?: number | undefined;
  gifInterval?: number | undefined;
};
export type Heic2AnyModule = (mod: Heic2any) => Promise<Blob | Blob[]>;
