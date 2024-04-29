import { DocumentRequestKind, SupportedIdDocTypes } from '@onefootprint/types';

import type { NonIdDocKinds } from '../types';

const requestKindToDocType: Record<NonIdDocKinds, SupportedIdDocTypes> = {
  [DocumentRequestKind.ProofOfAddress]: SupportedIdDocTypes.proofOfAddress,
  [DocumentRequestKind.ProofOfSsn]: SupportedIdDocTypes.ssnCard,
  [DocumentRequestKind.Custom]: SupportedIdDocTypes.custom,
};

export default requestKindToDocType;
