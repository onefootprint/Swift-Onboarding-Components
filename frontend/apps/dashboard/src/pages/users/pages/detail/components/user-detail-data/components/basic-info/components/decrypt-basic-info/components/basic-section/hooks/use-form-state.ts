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
  const fullName = useWatch({ control, name: UserDataAttribute.firstName });
  const email = useWatch({ control, name: UserDataAttribute.email });
  const phoneNumber = useWatch({
    control,
    name: UserDataAttribute.phoneNumber,
  });

  const isCheckboxDisabled = (value?: string | null) => value !== undefined;

  const fieldsState = {
    [UserDataAttribute.firstName]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.firstName,
      ),
      checked: !!fullName,
      disabled: isCheckboxDisabled(user.attributes.firstName.value),
    },
    [UserDataAttribute.email]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.email),
      checked: !!email,
      disabled: isCheckboxDisabled(user.attributes.email.value),
    },
    [UserDataAttribute.phoneNumber]: {
      visible: user.identityDataAttributes.includes(
        UserDataAttribute.phoneNumber,
      ),
      checked: !!phoneNumber,
      disabled: isCheckboxDisabled(user.attributes.phoneNumber.value),
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
