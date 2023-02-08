import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import DataRow from '../data-row';
import DataSection from '../data-section';
import RiskSignals from '../risk-signals-overview';
import useFormState from './hooks/use-form-state';

type AddressSectionProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const AddressSection = ({
  user,
  vaultData,
  isDecrypting,
}: AddressSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { kycData } = vaultData;
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
      vaultData,
    });

  const selectValue = (value: boolean) => {
    if (!fieldsState[UserDataAttribute.country].disabled) {
      setValue(`kycData.${UserDataAttribute.country}`, value);
    }
    if (!fieldsState[UserDataAttribute.addressLine1].disabled) {
      setValue(`kycData.${UserDataAttribute.addressLine1}`, value);
    }
    if (!fieldsState[UserDataAttribute.addressLine2].disabled) {
      setValue(`kycData.${UserDataAttribute.addressLine2}`, value);
    }
    if (!fieldsState[UserDataAttribute.city].disabled) {
      setValue(`kycData.${UserDataAttribute.city}`, value);
    }
    if (!fieldsState[UserDataAttribute.zip].disabled) {
      setValue(`kycData.${UserDataAttribute.zip}`, value);
    }
    if (!fieldsState[UserDataAttribute.state].disabled) {
      setValue(`kycData.${UserDataAttribute.state}`, value);
    }
  };

  const handleDeselectAll = () => {
    selectValue(false);
  };

  const handleSelectAll = () => {
    selectValue(true);
  };

  const renderCta = () => {
    const hideCta = !isDecrypting || areAllFieldsDisabled;

    return hideCta ? null : (
      <LinkButton
        onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
        size="compact"
      >
        {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
      </LinkButton>
    );
  };
  const footer = user.isPortable && <RiskSignals type="address" />;

  return (
    <DataSection
      iconComponent={IcoBuilding24}
      title={t('address.title')}
      footer={footer}
      renderCta={renderCta}
      testID="address-section"
    >
      {fieldsState[UserDataAttribute.addressLine1].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.addressLine1}`)}
          data={kycData[UserDataAttribute.addressLine1]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.addressLine1}`),
            ...fieldsState[UserDataAttribute.addressLine1],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.addressLine2].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.addressLine2}`)}
          data={kycData[UserDataAttribute.addressLine2]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.addressLine2}`),
            ...fieldsState[UserDataAttribute.addressLine2],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.city].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.city}`)}
          data={kycData[UserDataAttribute.city]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.city}`),
            ...fieldsState[UserDataAttribute.city],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.state].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.state}`)}
          data={kycData[UserDataAttribute.state]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.state}`),
            ...fieldsState[UserDataAttribute.state],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.zip].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.zip}`)}
          data={kycData[UserDataAttribute.zip]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.zip}`),
            ...fieldsState[UserDataAttribute.zip],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.country].exists && (
        <DataRow
          label={allT(`user-data-attributes.${UserDataAttribute.country}`)}
          data={kycData[UserDataAttribute.country]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.country}`),
            ...fieldsState[UserDataAttribute.country],
            visible: isDecrypting,
          }}
        />
      )}
    </DataSection>
  );
};

export default AddressSection;
