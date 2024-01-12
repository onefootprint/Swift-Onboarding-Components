import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import {
  IcoBook16,
  IcoFileText16,
  IcoHome16,
  IcoKey16,
  IcoLayer0116,
  IcoSettings16,
  IcoStore16,
  IcoUsers16,
  IcoWebhook16,
} from '@onefootprint/icons';

type Route = {
  title?: string;
  items: { href: string; Icon: Icon; text: string; badgeCount?: number }[];
};

const useRoutes = (): Route[] => {
  const { t } = useTranslation('components.private-layout.nav');
  const routes = [
    {
      title: '',
      items: [
        {
          href: '/home',
          Icon: IcoHome16,
          text: t('home'),
        },
        {
          href: '/users',
          Icon: IcoUsers16,
          text: t('users'),
        },
        {
          href: '/businesses',
          Icon: IcoStore16,
          text: t('businesses'),
        },

        {
          href: '/security-logs',
          Icon: IcoFileText16,
          text: t('security-logs'),
        },
      ],
    },
    {
      title: t('configure'),
      items: [
        {
          href: '/playbooks',
          Icon: IcoBook16,
          text: t('playbooks'),
        },
        {
          href: '/api-keys',
          Icon: IcoKey16,
          text: t('api-keys'),
        },
        {
          href: '/proxy-configs',
          Icon: IcoLayer0116,
          text: t('proxy-configs'),
        },
        {
          href: '/webhooks',
          Icon: IcoWebhook16,
          text: t('webhooks'),
        },
        {
          href: '/settings',
          Icon: IcoSettings16,
          text: t('settings'),
        },
      ],
    },
  ];

  return routes;
};

export default useRoutes;
