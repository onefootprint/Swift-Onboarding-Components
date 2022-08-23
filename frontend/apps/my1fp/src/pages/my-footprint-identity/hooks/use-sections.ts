import { useTranslation } from 'hooks';
import type { Icon } from 'icons';
import {
  IcoBuilding24,
  IcoFileText24,
  IcoShield24,
  IcoUserCircle24,
} from 'icons';
import React from 'react';

import AccessLogs from '../components/sections/access-logs';
import AccountsVerified from '../components/sections/accounts-verified';
import Address from '../components/sections/address';
import Identity from '../components/sections/identity';
import LoginAndSecurity from '../components/sections/login-and-security';

export type Section = {
  id: number;
  Content: React.ComponentType<{}>;
  iconComponent: Icon;
  title: string;
};

const useSection = (): Section[] => {
  const { t } = useTranslation('pages.my-footprint-identity');
  return [
    {
      id: 1,
      title: t('identity.title'),
      iconComponent: IcoUserCircle24,
      Content: Identity,
    },
    {
      id: 2,
      title: t('address.title'),
      iconComponent: IcoBuilding24,
      Content: Address,
    },
    {
      id: 3,
      title: t('login-and-security.title'),
      iconComponent: IcoShield24,
      Content: LoginAndSecurity,
    },
    {
      id: 4,
      title: t('accounts-verified.title'),
      iconComponent: IcoShield24,
      Content: AccountsVerified,
    },
    {
      id: 5,
      title: t('access-logs.title'),
      iconComponent: IcoFileText24,
      Content: AccessLogs,
    },
  ];
};

export default useSection;
