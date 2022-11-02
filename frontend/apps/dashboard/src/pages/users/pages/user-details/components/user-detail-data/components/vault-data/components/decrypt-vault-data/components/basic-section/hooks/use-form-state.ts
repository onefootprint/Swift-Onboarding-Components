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
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.firstName,
      ),
      checked: !!fullName,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.firstName],
      ),
    },
    [UserDataAttribute.email]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.email),
      checked: !!email,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.email],
      ),
    },
    [UserDataAttribute.phoneNumber]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.phoneNumber,
      ),
      checked: !!phoneNumber,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.phoneNumber],
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
      fieldsState[UserDataAttribute.firstName].checked &&
      fieldsState[UserDataAttribute.email].disabled &&
      fieldsState[UserDataAttribute.phoneNumber].disabled,
  };
};

export default useFormState;
