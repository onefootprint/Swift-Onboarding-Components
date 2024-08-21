import type { Organization } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Avatar, createFontStyles } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import useUpdateOrgLogo from './hooks/use-update-org-logo';

type LogoProps = {
  organization: Organization;
};

const Logo = ({ organization }: LogoProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.logo',
  });
  const updateOrgLogoMutation = useUpdateOrgLogo();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }
    const form = new FormData();
    form.set('file', files[0]);
    updateOrgLogoMutation.mutate(form);
  };

  return (
    <LogoContainer>
      <Avatar name={organization.name} size="xlarge" src={organization.logoUrl} />

      <ButtonContainer>
        <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
          <Label>
            {t('cta')}
            <StyledInput type="file" accept="image/svg+xml, image/png, image/jpeg" onChange={handleChange} />
          </Label>
        </PermissionGate>
      </ButtonContainer>
    </LogoContainer>
  );
};

const Label = styled.label<{ disabled?: boolean }>`
  ${({ theme, disabled }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.accent};
    cursor: pointer;

    ${
      disabled &&
      css`
      pointer-events: none;
      opacity: 0.5;
    `
    }
  `}
`;

const StyledInput = styled.input`
  display: none;
`;

const LogoContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[5]};
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Logo;
