import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoFileText224,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { RoleScope, UserDataAttribute } from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';
import { User, UserVaultData } from 'src/pages/users/users.types';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';

import useFormValues from '../../../hooks/use-form-values';

const useRows = (
  user: User,
  vaultData: UserVaultData,
  isDecrypting: boolean,
) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { hasPermission } = usePermissions();
  const { kycData } = vaultData;
  const values = useFormValues();

  const getData = (attribute: UserDataAttribute, roleScopes: RoleScope[]) => {
    const canDecrypt = roleScopes.some(roleScope => hasPermission(roleScope));
    const value = kycData[attribute];
    const hasValue = user.identityDataAttributes.includes(attribute);
    const canAccess =
      !user.isPortable ||
      user.onboarding?.canAccessDataAttributes.includes(attribute);
    const isDataDecrypted = !!kycData[attribute];

    return {
      canAccess,
      canSelect: hasValue && !isDataDecrypted && canDecrypt && canAccess,
      checked: !!values.kycData[attribute],
      hasPermission: canDecrypt,
      isDataDecrypted,
      hasValue,
      label: allT(`user-data-attributes.${attribute}`),
      name: `kycData.${attribute}`,
      showCheckbox: isDecrypting,
      value,
    };
  };

  const basic = {
    title: t('basic.title'),
    icon: IcoFileText224,
    fields: [
      {
        ...getData(UserDataAttribute.firstName, [RoleScope.decryptName]),
        label: allT('collected-data-options.name'),
        value: getFullNameDataValue(
          kycData[UserDataAttribute.firstName],
          kycData[UserDataAttribute.lastName],
        ),
      },
      {
        ...getData(UserDataAttribute.email, [RoleScope.decryptEmail]),
      },
      {
        ...getData(UserDataAttribute.phoneNumber, [
          RoleScope.decryptPhoneNumber,
        ]),
      },
    ],
  };

  const identity = {
    title: t('identity.title'),
    icon: IcoUserCircle24,
    fields: [
      {
        ...getData(UserDataAttribute.ssn9, [RoleScope.decryptSsn9]),
      },
      {
        ...getData(UserDataAttribute.ssn4, [RoleScope.decryptSsn4]),
      },
      {
        ...getData(UserDataAttribute.dob, [RoleScope.decryptDob]),
      },
    ],
  };

  const address = {
    title: t('address.title'),
    icon: IcoBuilding24,
    fields: [
      {
        ...getData(UserDataAttribute.addressLine1, [
          RoleScope.decryptFullAddress,
        ]),
      },
      {
        ...getData(UserDataAttribute.addressLine2, [
          RoleScope.decryptFullAddress,
        ]),
      },
      {
        ...getData(UserDataAttribute.city, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(UserDataAttribute.state, [RoleScope.decryptFullAddress]),
      },
      {
        ...getData(UserDataAttribute.zip, [
          RoleScope.decryptPartialAddress,
          RoleScope.decryptFullAddress,
        ]),
      },
      {
        ...getData(UserDataAttribute.country, [
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

export default useRows;
