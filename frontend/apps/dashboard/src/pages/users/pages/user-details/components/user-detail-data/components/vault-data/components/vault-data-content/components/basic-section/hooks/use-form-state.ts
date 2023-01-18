import { UserDataAttribute } from '@onefootprint/types';
import { Control, FieldValues, useWatch } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import isCheckboxDisabled from '../../../../../utils/is-checkbox-disabled';

const useFormState = ({
  control,
  user,
  vaultData,
}: {
  control: Control<FieldValues>;
  user: User;
  vaultData: UserVaultData;
}) => {
  const fullName = useWatch({
    control,
    name: `kycData.${UserDataAttribute.firstName}`,
  });
  const email = useWatch({
    control,
    name: `kycData.${UserDataAttribute.email}`,
  });
  const phoneNumber = useWatch({
    control,
    name: `kycData.${UserDataAttribute.phoneNumber}`,
  });

  const fieldsState = {
    [UserDataAttribute.firstName]: {
      exists: user.identityDataAttributes.includes(UserDataAttribute.firstName),
      checked: !!fullName,
      disabled: isCheckboxDisabled(
        vaultData.kycData[UserDataAttribute.firstName],
      ),
    },
    [UserDataAttribute.email]: {
      exists: user.identityDataAttributes.includes(UserDataAttribute.email),
      checked: !!email,
      disabled: isCheckboxDisabled(vaultData.kycData[UserDataAttribute.email]),
    },
    [UserDataAttribute.phoneNumber]: {
      exists: user.identityDataAttributes.includes(
        UserDataAttribute.phoneNumber,
      ),
      checked: !!phoneNumber,
      disabled: isCheckboxDisabled(
        vaultData.kycData[UserDataAttribute.phoneNumber],
      ),
    },
  };

  return {
    fieldsState,
    areAllFieldsSelected:
      fieldsState[UserDataAttribute.firstName].checked &&
      fieldsState[UserDataAttribute.email].checked &&
      fieldsState[UserDataAttribute.phoneNumber].checked,
    areAllFieldsDisabled:
      fieldsState[UserDataAttribute.firstName].disabled &&
      fieldsState[UserDataAttribute.email].disabled &&
      fieldsState[UserDataAttribute.phoneNumber].disabled,
  };
};

export default useFormState;
