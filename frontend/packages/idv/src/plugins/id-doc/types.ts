import type { IdDocOutcome, IdDocRequirement } from '@onefootprint/types';

import type { BasePluginProps } from '../base-plugin';

export type IdDocCustomData = {
  requirement: IdDocRequirement;
  orgId: string;
  sandboxOutcome?: IdDocOutcome;
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
