import type { LangProp } from '@/app/types';
import { LangFallback } from '@/i18n';
import { getPartner, getPartnerMembers, getPartnerRoles } from '@/queries';

import SettingsPageContent from './content';

type PartnerDocsPageProps = { params: LangProp };

const SettingsPage = async ({ params }: PartnerDocsPageProps) => {
  const [partner, members, roles] = await Promise.all([
    getPartner(),
    getPartnerMembers().then(res =>
      res.data.map(x => ({
        ...x,
        role: {
          ...x.role,
          name: x.role.name.replace('CompliancePartner', ''),
        },
      })),
    ),
    getPartnerRoles({ kind: 'compliance_partner_dashboard_user' })
      .then(res => res.data)
      .then(list =>
        list.map(x => ({
          label: x.name.replace('CompliancePartner', ''),
          value: x.id,
        })),
      ),
  ]);

  return <SettingsPageContent lang={params.lang || LangFallback} members={members} partner={partner} roles={roles} />;
};

export default SettingsPage;
