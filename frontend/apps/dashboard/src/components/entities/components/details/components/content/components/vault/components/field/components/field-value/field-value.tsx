import type { DataIdentifier, VaultValue } from '@onefootprint/types';
import { BusinessDI, IdDI, isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import { Text } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldOrPlaceholder } from 'src/components';

import AddressCountrySelect from '../address-country-select';
import AddressLineInput from '../address-line-input';
import CitizenshipsInput from '../citizenships-input';
import CityInput from '../city-input';
import CountryOfBirthSelect from '../country-of-birth-select/country-of-birth-select';
import DateInput from '../date-input';
import EncryptedInput from '../encrypted-input/encrypted-input';
import LegalStatusSelect from '../legal-status-select';
import NameInput from '../name-input';
import SsnInput from '../ssn-input';
import StateSelect from '../state-select';
import VisaExpirationInput from '../visa-expiration-input';
import VisaKindSelect from '../visa-kind-select';
import ZipInput from '../zip-input';

export type FieldValueProps = {
  field: Record<string, boolean | string | DataIdentifier | VaultValue | Transforms | null | undefined>;
  renderValue?: (value: VaultValue, isValueDecrypted: boolean) => React.ReactNode;
};

const FieldValue = ({ field, renderValue }: FieldValueProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const { value, showEditView, canEditField, isDecrypted, name: di, transforms } = field;
  const name = di as string;

  if (showEditView) {
    if (!canEditField) {
      return (
        <Text variant="body-3" color="tertiary">
          {t('not-allowed')}
        </Text>
      );
    }
    if (!isDecrypted && !isVaultDataEmpty(value)) {
      return <EncryptedInput />;
    }
    if (
      name === IdDI.firstName ||
      name === IdDI.lastName ||
      name === IdDI.middleName ||
      name === BusinessDI.name ||
      name === BusinessDI.doingBusinessAs
    ) {
      return <NameInput fieldName={name} fieldValue={value} />;
    }
    if (name === IdDI.dob || name === BusinessDI.formationDate) {
      return <DateInput value={value} fieldName={name} />;
    }
    if (name === IdDI.ssn9 || name === IdDI.ssn4) {
      return <SsnInput fieldName={name} fieldValue={value} />;
    }
    if (
      name === IdDI.addressLine1 ||
      name === IdDI.addressLine2 ||
      name === BusinessDI.addressLine1 ||
      name === BusinessDI.addressLine2
    ) {
      return <AddressLineInput fieldName={name} fieldValue={value} />;
    }
    if (name === IdDI.city || name === BusinessDI.city) {
      return <CityInput fieldName={name} value={value} />;
    }
    if (name === IdDI.state || name === BusinessDI.state) {
      return <StateSelect value={value} fieldName={name} />;
    }
    if (name === IdDI.country || name === BusinessDI.country || name === BusinessDI.formationState) {
      return <AddressCountrySelect value={value} fieldName={name} />;
    }
    if (name === IdDI.zip || name === BusinessDI.zip) {
      return <ZipInput value={value} fieldName={name} />;
    }

    if (name === IdDI.usLegalStatus) {
      return <LegalStatusSelect value={value} />;
    }
    if (name === IdDI.nationality) {
      return <CountryOfBirthSelect value={value} />;
    }
    if (name === IdDI.visaKind) {
      return <VisaKindSelect value={value} />;
    }
    if (name === IdDI.visaExpirationDate) {
      return <VisaExpirationInput value={value} />;
    }
    if (name === IdDI.citizenships) {
      return <CitizenshipsInput citizenships={value as string[] | undefined} />;
    }
  }

  if (isVaultDataEmpty(value) || !renderValue) {
    return <FieldOrPlaceholder data={value} transforms={transforms as Transforms} />;
  }

  return renderValue(value, isVaultDataDecrypted(value)) as JSX.Element;
};

export default FieldValue;
