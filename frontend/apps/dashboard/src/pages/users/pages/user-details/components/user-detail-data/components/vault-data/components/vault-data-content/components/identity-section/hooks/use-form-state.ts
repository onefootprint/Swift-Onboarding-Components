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
  const ssn9 = useWatch({
    control,
    name: `kycData.${UserDataAttribute.ssn9}`,
  });
  const ssn4 = useWatch({
    control,
    name: `kycData.${UserDataAttribute.ssn4}`,
  });
  const dob = useWatch({
    control,
    name: `kycData.${UserDataAttribute.dob}`,
  });

  const fieldsState = {
    [UserDataAttribute.ssn9]: {
      exists: user.identityDataAttributes.includes(UserDataAttribute.ssn9),
      checked: !!ssn9,
      disabled: isCheckboxDisabled(vaultData.kycData[UserDataAttribute.ssn9]),
    },
    [UserDataAttribute.ssn4]: {
      exists: user.identityDataAttributes.includes(UserDataAttribute.ssn4),
      checked: !!ssn4,
      disabled: isCheckboxDisabled(vaultData.kycData[UserDataAttribute.ssn4]),
    },
    [UserDataAttribute.dob]: {
      exists: user.identityDataAttributes.includes(UserDataAttribute.dob),
      checked: !!dob,
      disabled: isCheckboxDisabled(vaultData.kycData[UserDataAttribute.dob]),
    },
  };

  return {
    fieldsState,
    areAllFieldsSelected:
      fieldsState[UserDataAttribute.ssn9].checked &&
      fieldsState[UserDataAttribute.ssn4].checked &&
      fieldsState[UserDataAttribute.dob].checked,
    areAllFieldsDisabled:
      fieldsState[UserDataAttribute.ssn9].disabled &&
      fieldsState[UserDataAttribute.ssn4].disabled &&
      fieldsState[UserDataAttribute.dob].disabled,
  };
};

export default useFormState;
