import { Icon } from '@onefootprint/icons';
import {
  DataIdentifier,
  VaultEmptyData,
  VaultEncryptedData,
  VaultValue,
} from '@onefootprint/types';

export type FormData = Partial<
  Record<DataIdentifier, boolean | VaultEncryptedData | VaultEmptyData>
>;

export type DiField = {
  di: DataIdentifier;
  renderCustomField?: (options: {
    canDecrypt: boolean;
    disabled: boolean;
    label: string;
    name: DataIdentifier;
    showCheckbox: boolean;
    value: VaultValue;
  }) => React.ReactNode;
};

export type Fieldset = Record<
  string,
  { fields: DiField[]; iconComponent: Icon; title: string }
>;
