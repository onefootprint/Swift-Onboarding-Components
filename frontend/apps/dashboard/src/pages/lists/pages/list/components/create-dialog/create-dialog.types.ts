import type { ListKind } from '@onefootprint/request-types/dashboard';
import type { SelectOption } from '@onefootprint/ui';

export type FormData = {
  name: string;
  kind: SelectOption<ListKind>;
  entries: string;
};
