import type { Icon } from '@onefootprint/icons';
import type {
  DataIdentifier,
  Entity,
  SupportedIdDocTypes,
  VaultEmptyData,
  VaultEncryptedData,
  VaultValue,
} from '@onefootprint/types';

/**
 * For legacy reasons, decryption controls expect fields to be registered as just the DI.
 * We should put these in a wrapper
 */
type DecryptDiFormData = Partial<Record<DataIdentifier, boolean>>;

/**
 * Document fields are identified by the doc type
 */
type DecryptDocumentFormData = {
  documents?: Partial<Record<SupportedIdDocTypes, boolean>>;
};

export type DecryptFormData = DecryptDiFormData & DecryptDocumentFormData;

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
