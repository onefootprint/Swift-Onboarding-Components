import type { Icon } from '@onefootprint/icons';
import { IcoFileText16, IcoStore16 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

type Route = {
  title?: string;
  employeesOnly: boolean;
  items: { href: string; Icon: Icon; text: string; badgeCount?: number }[];
};

const useRoutes = (): Route[] => {
  const { t } = useTranslation('common', { keyPrefix: 'nav' });
  const routes = [
    {
      title: '',
      employeesOnly: false,
      items: [
        {
          href: '/app/companies',
          Icon: IcoStore16,
          text: t('home'),
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
      ],
    },
  ];

  return routes;
};

export default useRoutes;
