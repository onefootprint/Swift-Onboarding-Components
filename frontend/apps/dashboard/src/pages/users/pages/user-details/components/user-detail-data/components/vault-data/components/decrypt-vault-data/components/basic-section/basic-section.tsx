import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { Checkbox, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import DataSection from '../../../data-section';
import RiskSignals from '../../../risk-signals';
import useFormState from './hooks/use-form-state';

const BasicSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const userId = useUserId();
  const { user } = useUser(userId);
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
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

  return (
    <DataSection
      iconComponent={IcoFileText224}
      title={t('basic.title')}
      footer={<RiskSignals type="basic" />}
      renderCta={() =>
        areAllFieldsDisabled ? null : (
          <LinkButton
            onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
            size="compact"
          >
            {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
          </LinkButton>
        )
      }
    >
      {fieldsState[UserDataAttribute.firstName].visible && (
        <Checkbox
          {...register(`kycData.${UserDataAttribute.firstName}`)}
          disabled={fieldsState[UserDataAttribute.firstName].disabled}
          label={allT('collected-kyc-data-options.name')}
        />
      )}
      {fieldsState[UserDataAttribute.email].visible && (
        <Checkbox
          {...register(`kycData.${UserDataAttribute.email}`)}
          disabled={fieldsState[UserDataAttribute.email].disabled}
          label={allT('collected-kyc-data-options.email')}
        />
      )}
      {fieldsState[UserDataAttribute.phoneNumber].visible && (
        <Checkbox
          {...register(`kycData.${UserDataAttribute.phoneNumber}`)}
          disabled={fieldsState[UserDataAttribute.phoneNumber].disabled}
          label={allT('collected-kyc-data-options.phone_number')}
        />
      )}
    </DataSection>
  );
};

export default BasicSection;
