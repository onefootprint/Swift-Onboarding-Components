import type { IdDocOutcome, IdDocRequirement } from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';

export type IdDocContext = {
  requirement: IdDocRequirement;
  orgId: string;
  sandboxOutcome?: IdDocOutcome;
};

export type IdDocProps = {
  context: IdDocContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

type Heic2any = {
  blob: Blob;
  multiple?: true | undefined;
  toType?: string | undefined;
  quality?: number | undefined;
  gifInterval?: number | undefined;
};
export type Heic2AnyModule = (mod: Heic2any) => Promise<Blob | Blob[]>;
