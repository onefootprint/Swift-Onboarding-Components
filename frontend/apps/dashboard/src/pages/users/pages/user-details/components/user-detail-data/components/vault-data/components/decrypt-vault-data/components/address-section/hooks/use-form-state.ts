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
  const country = useWatch({
    control,
    name: `kycData.${UserDataAttribute.country}`,
  });
  const addressLine1 = useWatch({
    control,
    name: `kycData.${UserDataAttribute.addressLine1}`,
  });
  const addressLine2 = useWatch({
    control,
    name: `kycData.${UserDataAttribute.addressLine2}`,
  });
  const city = useWatch({
    control,
    name: `kycData.${UserDataAttribute.city}`,
  });
  const zip = useWatch({
    control,
    name: `kycData.${UserDataAttribute.zip}`,
  });
  const state = useWatch({
    control,
    name: `kycData.${UserDataAttribute.state}`,
  });

  const fieldsState = {
    [UserDataAttribute.country]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.country),
      checked: !!country,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.country],
      ),
    },
    [UserDataAttribute.addressLine1]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.addressLine1,
      ),
      checked: !!addressLine1,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.addressLine1],
      ),
    },
    [UserDataAttribute.addressLine2]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.addressLine2,
      ),
      checked: !!addressLine2,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.addressLine2],
      ),
    },
    [UserDataAttribute.city]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.city),
      checked: !!city,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.city],
      ),
    },
    [UserDataAttribute.zip]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.zip),
      checked: !!zip,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.zip],
      ),
    },
    [UserDataAttribute.state]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.state),
      checked: !!state,
      disabled: isCheckboxDisabled(
        user.vaultData.kycData[UserDataAttribute.state],
      ),
    },
  };

  return {
    fieldsState,
    areAllFieldsSelected:
      fieldsState[UserDataAttribute.country].checked &&
      fieldsState[UserDataAttribute.addressLine1].checked &&
      fieldsState[UserDataAttribute.addressLine2].checked &&
      fieldsState[UserDataAttribute.city].checked &&
      fieldsState[UserDataAttribute.zip].checked &&
      fieldsState[UserDataAttribute.state].checked,
    areAllFieldsDisabled:
      fieldsState[UserDataAttribute.country].disabled &&
      fieldsState[UserDataAttribute.addressLine1].disabled &&
      fieldsState[UserDataAttribute.addressLine2].disabled &&
      fieldsState[UserDataAttribute.city].disabled &&
      fieldsState[UserDataAttribute.zip].disabled &&
      fieldsState[UserDataAttribute.state].disabled,
  };
};

export default useFormState;
