import { RoleScopeKind } from '@onefootprint/types';

import { DecryptOption } from './components/permissions/hooks/use-decrypt-options';

export type FormData = {
  decryptOptions: { label: string; value: DecryptOption }[];
  name: string;
  scopeKinds: Exclude<RoleScopeKind, RoleScopeKind.decrypt>[];
  showDecrypt: boolean;
};
