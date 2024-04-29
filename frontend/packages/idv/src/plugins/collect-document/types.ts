import type {
  CountryCode,
  IdDocImageProcessingError,
  IdDocImageUploadError,
  IdDocOutcome,
  IdDocRequirement,
} from '@onefootprint/types';

import type { CommonIdvContext } from '../../utils/state-machine';

export type IdDocContext = {
  requirement: IdDocRequirement;
  orgId: string;
  sandboxOutcome?: IdDocOutcome;
  obConfigSupportedCountries?: CountryCode[];
};

export type IdDocProps = {
  context: IdDocContext;
  idvContext: CommonIdvContext;
  onDone: () => void;
};

export type IdDocImageErrorType = {
  errorType: IdDocImageProcessingError | IdDocImageUploadError;
  errorInfo?: string;
};

export type CaptureKind = 'auto' | 'manual' | 'upload';

type Heic2any = {
  blob: Blob;
  multiple?: true | undefined;
  toType?: string | undefined;
  quality?: number | undefined;
  gifInterval?: number | undefined;
};
export type Heic2AnyModule = (mod: Heic2any) => Promise<Blob | Blob[]>;
