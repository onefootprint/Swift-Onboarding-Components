import type { Icon } from '@onefootprint/icons';
import type {
  DataIdentifier,
  Entity,
  VaultEmptyData,
  VaultEncryptedData,
} from '@onefootprint/types';

export type FormData = Partial<
  Record<DataIdentifier, boolean | VaultEncryptedData | VaultEmptyData>
>;

export type DiField = {
  di: DataIdentifier;
  renderCustomField?: (options: {
    entity: Entity;
    di: DataIdentifier;
  }) => React.ReactNode;
};

export type Fieldset = Record<
  string,
  { fields: DiField[]; iconComponent: Icon; title: string }
>;
