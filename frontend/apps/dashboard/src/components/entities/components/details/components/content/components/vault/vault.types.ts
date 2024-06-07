import type { Icon } from '@onefootprint/icons';
import type { DataIdentifier, Entity, VaultEmptyData, VaultEncryptedData, VaultValue } from '@onefootprint/types';

export type DecryptFormData = Partial<Record<DataIdentifier, boolean | VaultEncryptedData | VaultEmptyData>>;

export type EditFormData = Record<string, VaultValue>;

export type EditSubmitData = Partial<Record<DataIdentifier, VaultValue>>;

export type DiField = {
  di: DataIdentifier;
  renderCustomField?: (options: {
    entity: Entity;
    di: DataIdentifier;
  }) => React.ReactNode;
};

export type Fieldset = Record<string, { fields: DiField[]; iconComponent: Icon; title: string }>;
