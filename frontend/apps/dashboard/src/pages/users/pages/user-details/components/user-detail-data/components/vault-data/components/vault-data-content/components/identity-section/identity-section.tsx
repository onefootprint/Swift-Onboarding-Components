import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import DataRow from '../data-row';
import DataSection from '../data-section';
import RiskSignals from '../risk-signals-overview';
import useFormState from './hooks/use-form-state';

type IdentitySectionProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const IdentitySection = ({
  user,
  vaultData,
  isDecrypting,
}: IdentitySectionProps) => {
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
    if (!fieldsState[UserDataAttribute.ssn9].disabled) {
      setValue(`kycData.${UserDataAttribute.ssn9}`, value);
    }
    if (!fieldsState[UserDataAttribute.ssn4].disabled) {
      setValue(`kycData.${UserDataAttribute.ssn4}`, value);
    }
    if (!fieldsState[UserDataAttribute.dob].disabled) {
      setValue(`kycData.${UserDataAttribute.dob}`, value);
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
        disabled={areAllFieldsDisabled}
        onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
        size="compact"
      >
        {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
      </LinkButton>
    );
  };

  return (
    <DataSection
      iconComponent={IcoUserCircle24}
      title={t('identity.title')}
      footer={<RiskSignals type="identity" />}
      renderCta={renderCta}
      testID="identity-section"
    >
      {fieldsState[UserDataAttribute.ssn9].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.ssn9')}
          data={kycData[UserDataAttribute.ssn9]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.ssn9}`),
            ...fieldsState[UserDataAttribute.ssn9],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.ssn4].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.ssn4')}
          data={kycData[UserDataAttribute.ssn4]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.ssn4}`),
            ...fieldsState[UserDataAttribute.ssn4],
            visible: isDecrypting,
          }}
        />
      )}
      {fieldsState[UserDataAttribute.dob].exists && (
        <DataRow
          label={allT('collected-kyc-data-options.dob')}
          data={kycData[UserDataAttribute.dob]}
          checkbox={{
            register: register(`kycData.${UserDataAttribute.dob}`),
            ...fieldsState[UserDataAttribute.dob],
            visible: isDecrypting,
          }}
        />
      )}
    </DataSection>
  );
};

export default IdentitySection;
