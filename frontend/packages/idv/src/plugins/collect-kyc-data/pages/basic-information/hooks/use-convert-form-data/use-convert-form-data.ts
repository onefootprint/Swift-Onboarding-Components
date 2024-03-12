import { IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { KycData } from '../../../../utils/data-types';
import getFieldStats from '../../get-field-stats';
import type { FormData } from '../../types';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const {
    dob: dobField,
    email: emailField,
    firstName: firstNameField,
    fullName: fullNameField,
    lastName: lastNameField,
    middleName: middleNameField,
    nationality: natField,
    phone: phoneField,
  } = getFieldStats(state.context);

  return (formData: FormData) => {
    const output: KycData = {};
    const {
      dob,
      email,
      firstName,
      lastName,
      middleName,
      nationality,
      phoneNumber,
    } = formData;

    if (fullNameField.required) {
      if (firstName) {
        const isFirstNameChanged = firstName !== firstNameField.value;
        output[IdDI.firstName] = {
          bootstrap: isFirstNameChanged ? false : firstNameField.bootstrap,
          decrypted: isFirstNameChanged ? false : firstNameField.decrypted,
          dirty: isFirstNameChanged,
          disabled: firstNameField.disabled,
          value: firstName,
        };
      }
      if (middleName) {
        const isMiddleNameChanged = middleName !== middleNameField.value;
        output[IdDI.middleName] = {
          bootstrap: isMiddleNameChanged ? false : middleNameField.bootstrap,
          decrypted: isMiddleNameChanged ? false : middleNameField.decrypted,
          dirty: isMiddleNameChanged,
          disabled: middleNameField.disabled,
          value: middleName,
        };
      }
      if (lastName) {
        const isLastNameChanged = lastName !== lastNameField.value;
        output[IdDI.lastName] = {
          bootstrap: isLastNameChanged ? false : lastNameField.bootstrap,
          decrypted: isLastNameChanged ? false : lastNameField.decrypted,
          dirty: isLastNameChanged,
          disabled: lastNameField.disabled,
          value: lastName,
        };
      }
    }

    if (dobField.required && dob) {
      const isDobChanged = dob !== dobField.value;
      output[IdDI.dob] = {
        bootstrap: isDobChanged ? false : dobField.bootstrap,
        decrypted: isDobChanged ? false : dobField.decrypted,
        dirty: isDobChanged,
        disabled: dobField.disabled,
        value: dob,
      };
    }

    if (natField.required && nationality?.value) {
      const isNatChanged = nationality.value !== String(natField.value);
      output[IdDI.nationality] = {
        bootstrap: isNatChanged ? false : natField.bootstrap,
        decrypted: isNatChanged ? false : natField.decrypted,
        dirty: isNatChanged,
        disabled: natField.disabled,
        value: nationality.value,
      };
    }

    if (emailField.required && email) {
      const isEmailChanged = email !== emailField.value;
      output[IdDI.email] = {
        bootstrap: isEmailChanged ? false : emailField.bootstrap,
        decrypted: isEmailChanged ? false : emailField.decrypted,
        dirty: isEmailChanged,
        disabled: emailField.disabled,
        value: email,
      };
    }

    if (phoneField.required && phoneNumber) {
      const isPhoneChanged = phoneNumber !== phoneField.value;
      output[IdDI.phoneNumber] = {
        bootstrap: isPhoneChanged ? false : phoneField.bootstrap,
        decrypted: isPhoneChanged ? false : phoneField.decrypted,
        dirty: isPhoneChanged,
        disabled: phoneField.disabled,
        value: phoneNumber,
      };
    }

    return output;
  };
};

export default useConvertFormData;
