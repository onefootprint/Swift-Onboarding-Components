import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { BusinessDI, IdDI, isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import { Text } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import FieldOrPlaceholder from 'src/components/field-or-placeholder';
import Editable from '../../../vault-actions/components/edit-vault-drawer/components/editable';
import EncryptedInput from '../../../vault-actions/components/edit-vault-drawer/components/encrypted-input';

export type FieldValueProps = {
  field: Record<string, boolean | string | DataIdentifier | VaultValue | Transforms | null | undefined>;
  renderValue?: (value: VaultValue, isValueDecrypted: boolean) => React.ReactNode;
};

const FieldValue = ({ field, renderValue }: FieldValueProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets',
  });
  const { value, showEditView, canEdit, isDecrypted, name: di, transforms } = field;
  const name = di as string;

  if (showEditView) {
    if (!canEdit) {
      return (
        <Text variant="body-3" color="tertiary">
          {t('not-allowed')}
        </Text>
      );
    }
    if (!isDecrypted && !isVaultDataEmpty(value)) {
      return <EncryptedInput />;
    }

    const editableFields: (IdDI | BusinessDI)[] = [
      IdDI.firstName,
      IdDI.middleName,
      IdDI.lastName,
      IdDI.dob,
      IdDI.ssn9,
      IdDI.ssn4,
      IdDI.addressLine1,
      IdDI.addressLine2,
      IdDI.city,
      IdDI.state,
      IdDI.country,
      IdDI.zip,
      IdDI.nationality,
      IdDI.usLegalStatus,
      IdDI.visaKind,
      IdDI.visaExpirationDate,
      IdDI.citizenships,
      BusinessDI.name,
      BusinessDI.doingBusinessAs,
      BusinessDI.website,
      BusinessDI.tin,
      BusinessDI.corporationType,
      BusinessDI.addressLine1,
      BusinessDI.addressLine2,
      BusinessDI.city,
      BusinessDI.state,
      BusinessDI.country,
      BusinessDI.zip,
      BusinessDI.formationState,
      BusinessDI.formationDate,
    ];

    if (editableFields.includes(name as IdDI | BusinessDI)) {
      return <Editable value={value} fieldName={name as DataIdentifier} />;
    }
  }

  if (isVaultDataEmpty(value) || !renderValue) {
    return <FieldOrPlaceholder data={value} transforms={transforms as Transforms} />;
  }

  return renderValue(value, isVaultDataDecrypted(value)) as JSX.Element;
};

export default FieldValue;
