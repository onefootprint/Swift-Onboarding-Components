import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { Checkbox, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';

import DataContainer from '../data-container';
import useFormState from './hooks/use-form-state';

type IdentitySectionProps = {
  user: User;
};

const IdentitySection = ({ user }: IdentitySectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
    });

  const selectValue = (value: boolean) => {
    if (!fieldsState[UserDataAttribute.ssn9].disabled) {
      setValue(UserDataAttribute.ssn9, value);
    }
    if (!fieldsState[UserDataAttribute.ssn4].disabled) {
      setValue(UserDataAttribute.ssn4, value);
    }
    if (!fieldsState[UserDataAttribute.dob].disabled) {
      setValue(UserDataAttribute.dob, value);
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
      iconComponent={IcoUserCircle24}
      sx={{
        gridArea: '1 / 2 / span 1 / span 1',
      }}
      title={t('identity.title')}
      renderCta={() =>
        areAllFieldsDisabled ? null : (
          <LinkButton
            disabled={areAllFieldsDisabled}
            onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
            size="compact"
          >
            {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
          </LinkButton>
        )
      }
    >
      {fieldsState[UserDataAttribute.ssn9].visible && (
        <Checkbox
          {...register(UserDataAttribute.ssn9)}
          disabled={fieldsState[UserDataAttribute.ssn9].disabled}
          label={allT('collected-data-options.ssn9')}
        />
      )}
      {fieldsState[UserDataAttribute.ssn4].visible && (
        <Checkbox
          {...register(UserDataAttribute.ssn4)}
          disabled={fieldsState[UserDataAttribute.ssn4].disabled}
          label={allT('collected-data-options.ssn4')}
        />
      )}
      {fieldsState[UserDataAttribute.dob].visible && (
        <Checkbox
          {...register(UserDataAttribute.dob)}
          disabled={fieldsState[UserDataAttribute.dob].disabled}
          label={allT('collected-data-options.dob')}
        />
      )}
    </DataContainer>
  );
};

export default IdentitySection;
