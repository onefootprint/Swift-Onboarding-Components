import { IdDocType } from '@onefootprint/types';
import { Control, FieldValues } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import isCheckboxDisabled from '../../../../../utils/is-checkbox-disabled';
import useFormValues from '../../../hooks/use-form-values';

const useFormState = ({
  user,
  vaultData,
}: {
  control: Control<FieldValues>;
  user: User;
  vaultData: UserVaultData;
}) => {
  const values = useFormValues();

  const docTypes = user.identityDocumentInfo.map(info => info.type);
  const fieldsState = {
    [IdDocType.passport]: {
      exists: docTypes.includes(IdDocType.passport),
      checked: !!values.idDoc[IdDocType.passport],
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.passport]),
    },
    [IdDocType.idCard]: {
      exists: docTypes.includes(IdDocType.idCard),
      checked: !!values.idDoc[IdDocType.idCard],
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.idCard]),
    },
    [IdDocType.driversLicense]: {
      exists: docTypes.includes(IdDocType.driversLicense),
      checked: !!values.idDoc[IdDocType.driversLicense],
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.driversLicense]),
    },
  };

  const isChecked = (idDocType: IdDocType) => {
    const { exists, checked } = fieldsState[idDocType];
    if ((exists && checked) || !exists) {
      return true;
    }
    return false;
  };

  return {
    fieldsState,
    areAllFieldsSelected:
      isChecked(IdDocType.idCard) &&
      isChecked(IdDocType.passport) &&
      isChecked(IdDocType.driversLicense),
    areAllFieldsDisabled:
      fieldsState[IdDocType.passport].disabled &&
      fieldsState[IdDocType.idCard].disabled &&
      fieldsState[IdDocType.driversLicense].disabled,
  };
};

export default useFormState;
