import { useTranslation } from '@onefootprint/hooks';
import {
  DecryptedIdDocStatus,
  IdDocDI,
  RoleScope,
  Vault,
} from '@onefootprint/types';
import get from 'lodash/get';
import usePermissions from 'src/hooks/use-permissions';
import { User } from 'src/pages/users/users.types';

import useFormValues from '../../../hooks/use-form-values';

const useFields = (user: User, vault: Vault, isDecrypting: boolean) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const values = useFormValues();

  const getData = ({ attribute }: { attribute: IdDocDI }) => {
    const canDecrypt = hasPermission(RoleScope.decryptDocuments);
    const canAccessData =
      user.onboarding?.canAccessAttributes.includes(attribute);
    const value = vault.idDoc[attribute];
    const hasValue = user.attributes.includes(attribute);
    const canAccess = !user.isPortable || !!canAccessData;
    const isDataDecrypted = !!vault.idDoc[attribute];
    const isSuccessful = user.identityDocumentInfo.some(
      idDoc =>
        idDoc.dataIdentifier === attribute &&
        idDoc.status === DecryptedIdDocStatus.success,
    );
    const checked = !!get(values, attribute);

    return {
      canAccess,
      canSelect: hasValue && !isDataDecrypted && canDecrypt && canAccess,
      checked,
      hasPermission: canDecrypt,
      hasValue,
      isDataDecrypted,
      isSuccessful,
      label: t(`di.${attribute}`),
      name: attribute,
      showCheckbox: isDecrypting,
      value,
    };
  };

  const fields = [
    getData({ attribute: IdDocDI.passport }),
    getData({ attribute: IdDocDI.driverLicense }),
    getData({ attribute: IdDocDI.idCard }),
  ].filter(field => field.hasValue);

  return fields;
};

export default useFields;
