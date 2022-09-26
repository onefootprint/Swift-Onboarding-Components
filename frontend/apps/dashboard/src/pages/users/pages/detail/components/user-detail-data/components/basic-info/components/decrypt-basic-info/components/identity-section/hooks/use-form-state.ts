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
  const ssn9 = useWatch({ control, name: UserDataAttribute.ssn9 });
  const ssn4 = useWatch({ control, name: UserDataAttribute.ssn4 });
  const dob = useWatch({ control, name: UserDataAttribute.dob });

  const isCheckboxDisabled = (value?: string | null) => value !== undefined;

  const fieldsState = {
    [UserDataAttribute.ssn9]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.ssn9),
      checked: !!ssn9,
      disabled: isCheckboxDisabled(user.attributes.ssn9.value),
    },
    [UserDataAttribute.ssn4]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.ssn4),
      checked: !!ssn4,
      disabled: isCheckboxDisabled(user.attributes.ssn4.value),
    },
    [UserDataAttribute.dob]: {
      visible: user.identityDataAttributes.includes(UserDataAttribute.dob),
      checked: !!dob,
      disabled: isCheckboxDisabled(user.attributes.dob.value),
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
