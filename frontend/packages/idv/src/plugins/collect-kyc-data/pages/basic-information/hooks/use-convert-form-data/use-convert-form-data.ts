import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import type { KycData } from '../../../../utils/data-types';
import type { FormData } from '../../types';

const isTest = process.env.NODE_ENV === 'test';

const useConvertFormData = () => {
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(
    CollectedKycDataOption.nationality,
  );
  const requiresEmail =
    !isTest && attributes.includes(CollectedKycDataOption.email);
  const requiresPhone =
    !isTest && attributes.includes(CollectedKycDataOption.phoneNumber);

  return (formData: FormData) => {
    const convertedData: KycData = {};
    const {
      firstName,
      middleName,
      lastName,
      dob,
      nationality,
      email,
      phoneNumber,
    } = formData;
    const hasName = firstName || middleName || lastName;

    if (requiresName && hasName) {
      const oldFirstName = data[IdDI.firstName];
      const isFirstNameChanged = firstName !== oldFirstName?.value;
      convertedData[IdDI.firstName] = {
        value: firstName,
        dirty: isFirstNameChanged,
        bootstrap: Boolean(
          isFirstNameChanged ? false : oldFirstName?.bootstrap,
        ),
        disabled: Boolean(oldFirstName?.disabled),
        decrypted: Boolean(
          isFirstNameChanged ? false : oldFirstName?.decrypted,
        ),
      };

      const oldMiddleName = data[IdDI.middleName];
      const bothEmpty = !middleName === !oldMiddleName?.value;
      const isMiddleNameChanged =
        !bothEmpty && middleName !== oldMiddleName?.value;
      convertedData[IdDI.middleName] = {
        value: middleName,
        dirty: isMiddleNameChanged,
        bootstrap: Boolean(
          isMiddleNameChanged ? false : oldMiddleName?.bootstrap,
        ),
        disabled: Boolean(oldMiddleName?.disabled),
        decrypted: Boolean(
          isMiddleNameChanged ? false : oldMiddleName?.decrypted,
        ),
      };

      const oldLastName = data[IdDI.lastName];
      const isLastNameChanged = lastName !== oldLastName?.value;
      convertedData[IdDI.lastName] = {
        value: lastName,
        dirty: isLastNameChanged,
        bootstrap: Boolean(isLastNameChanged ? false : oldLastName?.bootstrap),
        disabled: Boolean(oldLastName?.disabled),
        decrypted: Boolean(isLastNameChanged ? false : oldLastName?.decrypted),
      };
    }

    if (requiresDob && dob) {
      const oldDob = data[IdDI.dob];
      const isChanged = dob !== oldDob?.value;
      convertedData[IdDI.dob] = {
        value: dob,
        dirty: isChanged,
        bootstrap: Boolean(isChanged ? false : oldDob?.bootstrap),
        disabled: Boolean(oldDob?.disabled),
        decrypted: Boolean(isChanged ? false : oldDob?.decrypted),
      };
    }

    if (requiresNationality && nationality) {
      const oldNationality = data[IdDI.nationality];
      const isChanged = nationality.value !== oldNationality?.value;
      convertedData[IdDI.nationality] = {
        value: nationality.value,
        dirty: isChanged,
        bootstrap: Boolean(isChanged ? false : oldNationality?.bootstrap),
        disabled: Boolean(oldNationality?.disabled),
        decrypted: Boolean(isChanged ? false : oldNationality?.decrypted),
      };
    }

    if (requiresEmail && email) {
      const oldEmail = data[IdDI.email];
      const isEmailChanged = email !== oldEmail?.value;
      convertedData[IdDI.email] = {
        bootstrap: Boolean(isEmailChanged ? false : oldEmail?.bootstrap),
        decrypted: Boolean(isEmailChanged ? false : oldEmail?.decrypted),
        dirty: isEmailChanged,
        disabled: Boolean(oldEmail?.disabled),
        value: email,
      };
    }

    if (requiresPhone && phoneNumber) {
      const oldPhone = data[IdDI.phoneNumber];
      const isPhoneChanged = phoneNumber !== oldPhone?.value;
      convertedData[IdDI.phoneNumber] = {
        bootstrap: Boolean(isPhoneChanged ? false : oldPhone?.bootstrap),
        decrypted: Boolean(isPhoneChanged ? false : oldPhone?.decrypted),
        dirty: isPhoneChanged,
        disabled: Boolean(oldPhone?.disabled),
        value: phoneNumber,
      };
    }

    return convertedData;
  };
};

export default useConvertFormData;
