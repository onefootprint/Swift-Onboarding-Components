import type { DocumentRequestKind } from '@onefootprint/types';

export type NonIdDocKinds = Exclude<
  DocumentRequestKind,
  DocumentRequestKind.Identity
>;
