import { useTranslation } from 'hooks';
import type { Icon } from 'icons';
import IcoBuilding24 from 'icons/ico/ico-building-24';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoShield24 from 'icons/ico/ico-shield-24';
import IcoUserCircle24 from 'icons/ico/ico-user-circle-24';
import dynamic from 'next/dynamic';
import React from 'react';

const Address = dynamic(() => import('../components/sections/address'));

const Basic = dynamic(() => import('../components/sections/basic'));

const Identity = dynamic(() => import('../components/sections/identity'));

const AccessLogs = dynamic(() => import('../components/sections/access-logs'));

const LoginAndSecurity = dynamic(
  () => import('../components/sections/login-and-security'),
);

export type Section = {
  id: number;
  Content: React.ComponentType<{}>;
  iconComponent: Icon;
  title: string;
};

const useSection = () => {
  const { t } = useTranslation('pages.my-footprint-identity');
  const top: Section[] = [
    {
      id: 1,
      title: t('basic.title'),
      iconComponent: IcoFileText24,
      Content: Basic,
    },
    {
      id: 2,
      title: t('identity.title'),
      iconComponent: IcoUserCircle24,
      Content: Identity,
    },
    {
      id: 3,
      title: t('address.title'),
      iconComponent: IcoBuilding24,
      Content: Address,
    },
  ];
  const bottom: Section[] = [
    {
      id: 4,
      title: t('login-and-security.title'),
      iconComponent: IcoShield24,
      Content: LoginAndSecurity,
    },
    {
      id: 5,
      title: t('access-logs.title'),
      iconComponent: IcoFileText24,
      Content: AccessLogs,
    },
  ];
  return { top, bottom };
};

export default useSection;
