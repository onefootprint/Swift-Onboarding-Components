import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoLock24, IcoLockOpen24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { Organization } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Divider, Toggle, Tooltip, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import PermissionGate from 'src/components/permission-gate';
import useUpdateOrg from 'src/hooks/use-update-org';

export type DomainAccessProps = {
  org: Organization;
};

const DomainAccess = ({ org }: DomainAccessProps) => {
  const { t } = useTranslation('pages.onboarding.invite.allow-domain-access');
  const updateOrgMutation = useUpdateOrg();
  const showRequestErrorToast = useRequestErrorToast();
  const [allowDomainAccess, setAllowDomainAccess] = useState(
    org.allowDomainAccess,
  );
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
            onError: showRequestErrorToast,
          },
        );
        setAllowDomainAccess(!allowDomainAccess);
      }}
    />
  );

  return (
    <Container data-testid="domain-access">
      <HeaderContainer>
        <Header>
          {allowDomainAccess ? (
            <IcoLockOpen24 testID="lock-open" />
          ) : (
            <IcoLock24 testID="lock-closed" />
          )}
          <Typography variant="label-3">{t('title')}</Typography>
        </Header>
        <Typography color="secondary" variant="body-3">
          {t('subtitle')}
        </Typography>
      </HeaderContainer>
      <Divider />
      <EnableContainer>
        <EnableSubContainer>
          <Typography color="secondary" variant="body-3">
            {t('action')}
          </Typography>
          &nbsp;
          <Typography color="secondary" variant="label-3">
            {org.domain}
          </Typography>
        </EnableSubContainer>
        {disableTogle ? (
          <Tooltip
            text={t('toggle.domain-already-claimed', { domain: org.domain })}
          >
            {toggle}
          </Tooltip>
        ) : (
          <PermissionGate
            fallbackText={t('toggle.cta-not-allowed')}
            scopeKind={RoleScopeKind.orgSettings}
            tooltipPosition="top"
          >
            {toggle}
          </PermissionGate>
        )}
      </EnableContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: flex-start;
    align-self: stretch;
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin-top: ${theme.spacing[5]};
    padding: ${theme.spacing[5]};
  `}
`;

const EnableSubContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const EnableContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    align-self: stretch;
  `}
`;

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[4]};
  `}
`;

export default DomainAccess;
