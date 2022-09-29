import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';
import { Checkbox, LinkButton } from 'ui';

import DataContainer from '../data-container';
import useFormState from './hooks/use-form-state';

type AddressSectionProps = {
  user: User;
};

const AddressSection = ({ user }: AddressSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
    });

  const selectValue = (value: boolean) => {
    if (!fieldsState[UserDataAttribute.country].disabled) {
      setValue(UserDataAttribute.country, value);
    }
    if (!fieldsState[UserDataAttribute.addressLine1].disabled) {
      setValue(UserDataAttribute.addressLine1, value);
    }
    if (!fieldsState[UserDataAttribute.addressLine2].disabled) {
      setValue(UserDataAttribute.addressLine2, value);
    }
    if (!fieldsState[UserDataAttribute.city].disabled) {
      setValue(UserDataAttribute.city, value);
    }
    if (!fieldsState[UserDataAttribute.zip].disabled) {
      setValue(UserDataAttribute.zip, value);
    }
    if (!fieldsState[UserDataAttribute.state].disabled) {
      setValue(UserDataAttribute.state, value);
    }
  };

  const handleDeselectAll = () => {
    selectValue(false);
  };

  const handleSelectAll = () => {
    selectValue(true);
  };

  return (
    <DataContainer
      sx={{
        gridArea: '2 / 1 / span 1 / span 1',
      }}
      iconComponent={IcoBuilding24}
      title={t('address.title')}
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
      {fieldsState[UserDataAttribute.country].visible && (
        <Checkbox
          {...register(UserDataAttribute.country)}
          disabled={fieldsState[UserDataAttribute.country].disabled}
          label={allT('user-data-attributes.country')}
        />
      )}
      {fieldsState[UserDataAttribute.addressLine1].visible && (
        <Checkbox
          {...register(UserDataAttribute.addressLine1)}
          disabled={fieldsState[UserDataAttribute.addressLine1].disabled}
          label={allT('user-data-attributes.address-line1')}
        />
      )}
      {fieldsState[UserDataAttribute.addressLine2].visible && (
        <Checkbox
          {...register(UserDataAttribute.addressLine2)}
          disabled={fieldsState[UserDataAttribute.addressLine2].disabled}
          label={allT('user-data-attributes.address-line2')}
        />
      )}
      {fieldsState[UserDataAttribute.city].visible && (
        <Checkbox
          {...register(UserDataAttribute.city)}
          disabled={fieldsState[UserDataAttribute.city].disabled}
          label={allT('user-data-attributes.city')}
        />
      )}
      {fieldsState[UserDataAttribute.zip].visible && (
        <Checkbox
          {...register(UserDataAttribute.zip)}
          disabled={fieldsState[UserDataAttribute.zip].disabled}
          label={allT('user-data-attributes.zip')}
        />
      )}
      {fieldsState[UserDataAttribute.state].visible && (
        <Checkbox
          {...register(UserDataAttribute.state)}
          disabled={fieldsState[UserDataAttribute.state].disabled}
          label={allT('user-data-attributes.state')}
        />
      )}
    </DataContainer>
  );
};

export default AddressSection;
