import type { Icon } from '@onefootprint/icons';
import { IcoFileText16, IcoSettings16, IcoStore16 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

import { DEFAULT_PRIVATE_ROUTE } from '@/config/constants';

type Route = {
  title?: string;
  employeesOnly: boolean;
  items: { href: string; Icon: Icon; text: string; badgeCount?: number }[];
};

const useRoutes = (): Route[] => {
  const { t } = useTranslation('common');
  const routes = [
    {
      title: '',
      employeesOnly: false,
      items: [
        {
          href: DEFAULT_PRIVATE_ROUTE,
          Icon: IcoStore16,
          text: t('companies.companies'),
        },
      ],
    },
    {
      title: t('configure'),
      employeesOnly: false,
      items: [
        {
          href: '/app/configure/documents',
          Icon: IcoFileText16,
          text: t('documents'),
        },
        {
          href: '/app/configure/settings',
          Icon: IcoSettings16,
          text: t('settings'),
        },
      ],
    },
  ];

  return routes;
};

export default useRoutes;
