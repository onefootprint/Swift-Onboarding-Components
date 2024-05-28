import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import type { TenantDetail } from '@onefootprint/types';
import { CodeInline, Stack } from '@onefootprint/ui';
import React from 'react';
import { Field, Fieldset } from 'src/components';

type TenantInfoProps = {
  tenant: TenantDetail;
};

const TenantInfo = ({ tenant }: TenantInfoProps) => {
  const checkbox = (value: boolean) =>
    value ? <IcoCheck24 /> : <IcoCloseSmall24 />;

  const basic = [
    {
      title: 'ID',
      content: <CodeInline>{tenant.id}</CodeInline>,
    },
    {
      title: 'Parent ID',
      content: tenant.superTenantId ? (
        <CodeInline>{tenant.superTenantId}</CodeInline>
      ) : (
        '-'
      ),
    },
    {
      title: 'Is demo tenant',
      content: checkbox(tenant.isDemoTenant),
    },
    {
      title: 'Domains',
      content: tenant.domains.length ? tenant.domains.join(', ') : 'No domains',
    },
    {
      title: 'Domain access',
      content: checkbox(tenant.allowDomainAccess),
    },
  ];

  const restrictions = [
    {
      title: 'General access',
      content: checkbox(!tenant.sandboxRestricted),
    },
    {
      title: 'KYC playbooks',
      content: checkbox(!tenant.isProdKycPlaybookRestricted),
    },
    {
      title: 'KYB playbooks',
      content: checkbox(!tenant.isProdKybPlaybookRestricted),
    },
    {
      title: 'Auth playbooks',
      content: checkbox(!tenant.isProdAuthPlaybookRestricted),
    },
  ];

  const settings = [
    {
      title: 'Required login methods',
      content: tenant.supportedAuthMethods?.length
        ? tenant.supportedAuthMethods.join(', ')
        : '-',
    },
    {
      title: 'Allowed preview APIs',
      content: tenant.allowedPreviewApis.length
        ? tenant.allowedPreviewApis.join(', ')
        : '-',
    },
    {
      title: 'Pinned API version',
      content: tenant.pinnedApiVersion || '-',
    },
  ];

  const sections = [
    {
      title: 'Basic info',
      fields: basic,
    },
    {
      title: 'Production access',
      fields: restrictions,
    },
    {
      title: 'Settings',
      fields: settings,
    },
  ];

  return (
    <Stack direction="column">
      {sections.map(section => (
        <Fieldset title={section.title} key={section.title}>
          <Stack direction="column" gap={5}>
            {section.fields.map(f => (
              <Field label={f.title} key={f.title}>
                {f.content}
              </Field>
            ))}
          </Stack>
        </Fieldset>
      ))}
    </Stack>
  );
};

export default TenantInfo;
