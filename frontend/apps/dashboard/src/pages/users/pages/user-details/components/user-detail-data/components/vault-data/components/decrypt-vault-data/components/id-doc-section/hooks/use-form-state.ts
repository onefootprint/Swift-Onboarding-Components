import { IdDocType } from '@onefootprint/types';
import { Control, FieldValues, useWatch } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import isCheckboxDisabled from '../../../utils/is-checkbox-disabled';

const useFormState = ({
  control,
  user,
  vaultData,
}: {
  control: Control<FieldValues>;
  user: User;
  vaultData: UserVaultData;
}) => {
  const passport = useWatch({
    control,
    name: `idDoc.${IdDocType.passport}`,
  });

  const idCard = useWatch({
    control,
    name: `idDoc.${IdDocType.idCard}`,
  });

  const driversLicense = useWatch({
    control,
    name: `idDoc.${IdDocType.driversLicense}`,
  });

  const fieldsState = {
    [IdDocType.passport]: {
      visible: user.identityDocumentTypes.includes(IdDocType.passport),
      checked: !!passport,
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.passport]),
    },
    [IdDocType.idCard]: {
      visible: user.identityDocumentTypes.includes(IdDocType.idCard),
      checked: !!idCard,
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.idCard]),
    },
    [IdDocType.driversLicense]: {
      visible: user.identityDocumentTypes.includes(IdDocType.driversLicense),
      checked: !!driversLicense,
      disabled: isCheckboxDisabled(vaultData.idDoc[IdDocType.driversLicense]),
    },
  };

  return {
    fieldsState,
    areAllFieldsSelected:
      fieldsState[IdDocType.passport].checked &&
      fieldsState[IdDocType.idCard].checked &&
      fieldsState[IdDocType.driversLicense].checked,
    areAllFieldsDisabled:
      fieldsState[IdDocType.passport].disabled &&
      fieldsState[IdDocType.idCard].disabled &&
      fieldsState[IdDocType.driversLicense].disabled,
  };
};

export default useFormState;
