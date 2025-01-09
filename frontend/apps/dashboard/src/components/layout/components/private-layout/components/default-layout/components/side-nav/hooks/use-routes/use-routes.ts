import type { Icon } from '@onefootprint/icons';
import {
  IcoBook16,
  IcoConstruct16,
  IcoFileText16,
  IcoHome16,
  IcoKey16,
  IcoLayer0116,
  IcoSettings16,
  IcoShuffle16,
  IcoStore16,
  IcoUsers16,
  IcoWebhook16,
  IcoWriting16,
} from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

type Route = {
  title?: string;
  employeesOnly: boolean;
  items: { href: string; Icon: Icon; text: string; badgeCount?: number }[];
};

type useRoutesProps = {
  riskOpsRequests?: number;
  isRiskOpsTeamMember?: boolean;
};

const useRoutes = ({ riskOpsRequests = undefined, isRiskOpsTeamMember = false }: useRoutesProps): Route[] => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });

  const routes = [
    {
      title: '',
      employeesOnly: false,
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
      employeesOnly: false,
      items: [
        {
          href: '/playbooks',
          Icon: IcoBook16,
          text: t('playbooks'),
        },
        {
          href: '/lists',
          Icon: IcoShuffle16,
          text: t('lists'),
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
    {
      title: t('internal'),
      employeesOnly: true,
      items: [
        {
          href: '/internal/tenants',
          Icon: IcoStore16,
          text: t('tenants'),
        },
        {
          href: '/internal/toolbox',
          Icon: IcoConstruct16,
          text: t('toolbox'),
        },
        ...(isRiskOpsTeamMember
          ? [
              {
                href: '/internal/risk-ops',
                Icon: IcoWriting16,
                text: t('edit-grant-requests'),
                badgeCount: riskOpsRequests,
              },
            ]
          : []),
      ],
    },
  ];

  return routes;
};

export default useRoutes;
