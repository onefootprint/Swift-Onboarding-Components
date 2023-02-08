import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';

import DataRow from '../data-row';
import DataSection from '../data-section';
import RiskSignals from '../risk-signals-overview';
import useFormState from './hooks/use-form-state';

type BasicSectionProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const BasicSection = ({ user, vaultData, isDecrypting }: BasicSectionProps) => {
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
    if (!fieldsState[UserDataAttribute.firstName].disabled) {
      setValue(`kycData.${UserDataAttribute.firstName}`, value);
    }
    if (!fieldsState[UserDataAttribute.email].disabled) {
      setValue(`kycData.${UserDataAttribute.email}`, value);
    }
    if (!fieldsState[UserDataAttribute.phoneNumber].disabled) {
      setValue(`kycData.${UserDataAttribute.phoneNumber}`, value);
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
  const footer = user.isPortable && <RiskSignals type="basic" />;

  return (
    <DataSection
      iconComponent={IcoFileText224}
      title={t('basic.title')}
      footer={footer}
      renderCta={renderCta}
      testID="basic-section"
    >
      {fieldsState[UserDataAttribute.firstName].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.name')}
          data={getFullNameDataValue(
            kycData[UserDataAttribute.firstName],
            kycData[UserDataAttribute.lastName],
          )}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.firstName}`),
            ...fieldsState[UserDataAttribute.firstName],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.email].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.email')}
          data={kycData[UserDataAttribute.email]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.email}`),
            ...fieldsState[UserDataAttribute.email],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.phoneNumber].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.phone_number')}
          data={kycData[UserDataAttribute.phoneNumber]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.phoneNumber}`),
            ...fieldsState[UserDataAttribute.phoneNumber],
            visible: isDecrypting,
          }}
        />
      )}
    </DataSection>
  );
};

export default BasicSection;
