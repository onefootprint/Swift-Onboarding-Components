import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoFileText224,
  IcoUserCircle24,
} from '@onefootprint/icons';
import {
  IdDI,
  isVaultDataDecrypted,
  RoleScope,
  Vault,
} from '@onefootprint/types';
import get from 'lodash/get';
import usePermissions from 'src/hooks/use-permissions';
import { User } from 'src/pages/users/users.types';
import getFullName from 'src/utils/get-full-name-data';

import useFormValues from '../../../hooks/use-form-values';

const useFields = (user: User, vault: Vault, isDecrypting: boolean) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { hasPermission } = usePermissions();
  const values = useFormValues();

  const getData = (attribute: IdDI, roleScopes: RoleScope[]) => {
    const canDecrypt = roleScopes.some(roleScope => hasPermission(roleScope));
    const value = vault.id[attribute];
    const hasValue = user.attributes.includes(attribute);
    const canAccessData =
      user.onboarding?.canAccessAttributes.includes(attribute);
    const canAccess = !user.isPortable || !!canAccessData;
    const isDataDecrypted = isVaultDataDecrypted(vault.id[attribute]);
    const checked = !!get(values, attribute);

    return {
      canAccess,
      canSelect: hasValue && !isDataDecrypted && canDecrypt && canAccess,
      checked,
      hasPermission: canDecrypt,
      isDataDecrypted,
      hasValue,
      label: allT(`di.${attribute}`),
      name: attribute,
      showCheckbox: isDecrypting,
      value,
    };
  };

  const basic = {
    title: t('basic.title'),
    icon: IcoFileText224,
    fields: [
      {
        ...getData(IdDI.firstName, [RoleScope.decryptName]),
        label: allT('cdo.name'),
        value: getFullName(vault.id[IdDI.firstName], vault.id[IdDI.lastName]),
      },
      {
        ...getData(IdDI.email, [RoleScope.decryptEmail]),
      },
      {
        ...getData(IdDI.phoneNumber, [RoleScope.decryptPhoneNumber]),
      },
    ],
  };

  const identity = {
    title: t('identity.title'),
    icon: IcoUserCircle24,
    fields: [
      {
        ...getData(IdDI.ssn9, [RoleScope.decryptSsn9]),
      },
      {
        ...getData(IdDI.ssn4, [RoleScope.decryptSsn4, RoleScope.decryptSsn9]),
      },
      {
        ...getData(IdDI.dob, [RoleScope.decryptDob]),
      },
    ],
  };

  const address = {
    title: t('address.title'),
    icon: IcoBuilding24,
    fields: [
      {
        ...getData(IdDI.addressLine1, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(IdDI.addressLine2, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(IdDI.city, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(IdDI.state, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(IdDI.zip, [
          RoleScope.decryptPartialAddress,
          RoleScope.decryptFullAddress,
        ]),
      },
      {
        ...getData(IdDI.country, [
          RoleScope.decryptPartialAddress,
          RoleScope.decryptFullAddress,
        ]),
      },
    ],
  };

  const fields = {
    basic,
    identity,
    address,
  };

  return fields;
};

export default useFields;
