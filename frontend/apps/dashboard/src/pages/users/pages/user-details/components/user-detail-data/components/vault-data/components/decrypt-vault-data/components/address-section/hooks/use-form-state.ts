import { UserDataAttribute } from '@onefootprint/types';
import { Control, FieldValues, useWatch } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';

const useFormState = ({
  control,
  user,
}: {
  control: Control<FieldValues>;
  user: User;
}) => {
  const country = useWatch({ control, name: UserDataAttribute.country });
  const addressLine1 = useWatch({
    control,
    name: UserDataAttribute.addressLine1,
  });
  const addressLine2 = useWatch({
    control,
    name: UserDataAttribute.addressLine2,
  });
  const city = useWatch({ control, name: UserDataAttribute.city });
  const zip = useWatch({ control, name: UserDataAttribute.zip });
  const state = useWatch({ control, name: UserDataAttribute.state });

  const isCheckboxDisabled = (value?: string | null) => value !== undefined;

  const fieldsState = {
    [UserDataAttribute.country]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.country),
      checked: !!country,
      disabled: isCheckboxDisabled(user.attributes.country.value),
    },
    [UserDataAttribute.addressLine1]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.addressLine1,
      ),
      checked: !!addressLine1,
      disabled: isCheckboxDisabled(user.attributes.addressLine1.value),
    },
    [UserDataAttribute.addressLine2]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.addressLine2,
      ),
      checked: !!addressLine2,
      disabled: isCheckboxDisabled(user.attributes.addressLine2.value),
    },
    [UserDataAttribute.city]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.city),
      checked: !!city,
      disabled: isCheckboxDisabled(user.attributes.city.value),
    },
    [UserDataAttribute.zip]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.zip),
      checked: !!zip,
      disabled: isCheckboxDisabled(user.attributes.zip.value),
    },
    [UserDataAttribute.state]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.state),
      checked: !!state,
      disabled: isCheckboxDisabled(user.attributes.state.value),
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
