import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import type React from 'react';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';

export type FieldValueProps = {
  field: Record<string, boolean | string | DataIdentifier | VaultValue | Transforms | null | undefined>;
  renderValue?: (value: VaultValue, isValueDecrypted: boolean) => React.ReactNode;
};

const FieldValue = ({ field, renderValue }: FieldValueProps) => {
  const { value, transforms } = field;

  if (isVaultDataEmpty(value) || !renderValue) {
    return <FieldOrPlaceholder data={value} transforms={transforms as Transforms} />;
  }

  return renderValue(value, isVaultDataDecrypted(value)) as JSX.Element;
};

export default FieldValue;
