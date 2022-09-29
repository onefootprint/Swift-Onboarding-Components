import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';
import { Checkbox, LinkButton } from 'ui';

import DataContainer from '../data-container';
import useFormState from './hooks/use-form-state';

type BasicSectionProps = {
  user: User;
};

const BasicSection = ({ user }: BasicSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
    });

  const selectValue = (value: boolean) => {
    if (!fieldsState[UserDataAttribute.firstName].disabled) {
      setValue(UserDataAttribute.firstName, value);
    }
    if (!fieldsState[UserDataAttribute.email].disabled) {
      setValue(UserDataAttribute.email, value);
    }
    if (!fieldsState[UserDataAttribute.phoneNumber].disabled) {
      setValue(UserDataAttribute.phoneNumber, value);
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
      iconComponent={IcoFileText224}
      sx={{ gridArea: '1 / 1 / span 1 / span 1' }}
      title={t('basic.title')}
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
          {...register(UserDataAttribute.firstName)}
          disabled={fieldsState[UserDataAttribute.firstName].disabled}
          label={allT('collected-data-options.name')}
        />
      )}
      {fieldsState[UserDataAttribute.email].visible && (
        <Checkbox
          {...register(UserDataAttribute.email)}
          disabled={fieldsState[UserDataAttribute.email].disabled}
          label={allT('collected-data-options.email')}
        />
      )}
      {fieldsState[UserDataAttribute.phoneNumber].visible && (
        <Checkbox
          {...register(UserDataAttribute.phoneNumber)}
          disabled={fieldsState[UserDataAttribute.phoneNumber].disabled}
          label={allT('collected-data-options.phone_number')}
        />
      )}
    </DataContainer>
  );
};

export default BasicSection;
