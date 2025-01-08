import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoLock24, IcoLockOpen24 } from '@onefootprint/icons';
import type { Organization } from '@onefootprint/request-types/dashboard';
import { Divider, Toggle, Tooltip } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import useUpdateOrg from 'src/hooks/use-update-org';
import createStringList from 'src/utils/create-string-list';

export type DomainAccessProps = {
  org: Organization;
};

const DomainAccess = ({ org }: DomainAccessProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'invite.allow-domain-access' });
  const updateOrgMutation = useUpdateOrg();
  const showRequestErrorToast = useRequestErrorToast();
  const [allowDomainAccess, setAllowDomainAccess] = useState(org.allowDomainAccess);
  // If the domain is claimed by another tenant, we disable the ability to enable domain access
  const disableTogle = !!org.isDomainAlreadyClaimed && !allowDomainAccess;

  const toggle = (
    <Toggle
      defaultChecked={false}
      disabled={disableTogle}
      checked={allowDomainAccess}
      onChange={() => {
        updateOrgMutation.mutate(
          {
            allowDomainAccess: !allowDomainAccess,
          },
          {
            onError: (error: unknown) => {
              showRequestErrorToast(error);
            },
          },
        );
        setAllowDomainAccess(!allowDomainAccess);
      }}
    />
  );

  if (!org.domains) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-4 items-start mt-4 p-4 border border-solid border-tertiary rounded self-stretch"
      data-testid="domain-access"
    >
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 self-stretch">
          {allowDomainAccess ? <IcoLockOpen24 testID="lock-open" /> : <IcoLock24 testID="lock-closed" />}
          <h3 className="text-label-3">{t('title')}</h3>
        </div>
        <h4 className="text-body-3 text-secondary">{t('subtitle')}</h4>
      </div>
      <Divider />
      <div className="flex justify-between w-full">
        <div className="flex">
          <p className="text-body-3 text-secondary">{t('action')}</p>
          &nbsp;
          <h4 className="text-label-3 text-secondary">{createStringList(org.domains)}</h4>
        </div>
        {disableTogle ? (
          <Tooltip
            text={t('toggle.domain-already-claimed', {
              domain: createStringList(org.domains),
            })}
          >
            {toggle}
          </Tooltip>
        ) : (
          <PermissionGate fallbackText={t('toggle.cta-not-allowed')} scopeKind="org_settings" tooltipPosition="top">
            {toggle}
          </PermissionGate>
        )}
      </div>
    </div>
  );
};

export default DomainAccess;
