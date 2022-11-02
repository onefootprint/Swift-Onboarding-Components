import { UserDataAttribute } from '@onefootprint/types';
import { Control, FieldValues, useWatch } from 'react-hook-form';
import { User } from 'src/pages/users/types/user.types';

import isCheckboxDisabled from '../../../utils/is-checkbox-disabled';

const useFormState = ({
  control,
  user,
}: {
  control: Control<FieldValues>;
  user: User;
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
      visible: user.identityDataAttributes.includes(UserDataAttribute.ssn9),
      checked: !!ssn9,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.ssn9],
      ),
    },
    [UserDataAttribute.ssn4]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.ssn4),
      checked: !!ssn4,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.ssn4],
      ),
    },
    [UserDataAttribute.dob]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.dob),
      checked: !!dob,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.dob],
      ),
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
