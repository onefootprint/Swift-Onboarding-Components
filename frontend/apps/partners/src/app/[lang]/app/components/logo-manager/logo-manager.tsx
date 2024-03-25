import type { Organization } from '@onefootprint/types';
// import { RoleScopeKind } from '@onefootprint/types';
import { Avatar, createFontStyles, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
// import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

// import useUpdateOrgLogo from './hooks/use-update-org-logo';

type LogoManagerProps = {
  organization: Organization;
};

const LogoManager = ({ organization }: LogoManagerProps) => {
  const { t } = useTranslation('common');
  // const updateOrgLogoMutation = useUpdateOrgLogo();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }
    const form = new FormData();
    form.set('file', files[0]);
    // updateOrgLogoMutation.mutate(form, {
    //   onError: (error: unknown) => {
    //     console.error('Updating business profile logo failed', error);
    //   },
    // });
  };

  return (
    <Stack gap={5}>
      <Avatar
        name={organization.name}
        size="large"
        src={organization.logoUrl}
      />

      <Stack alignItems="center" justifyContent="center">
        <CtaLabel>
          {t('change-logo')}
          <InvisibleInput
            type="file"
            accept="image/svg+xml, image/png, image/jpeg"
            onChange={handleChange}
          />
        </CtaLabel>
      </Stack>
    </Stack>
  );
};

const CtaLabel = styled.label<{ disabled?: boolean }>`
  ${({ theme, disabled }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.accent};
    cursor: pointer;

    ${disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `}
  `}
`;

const InvisibleInput = styled.input`
  display: none;
`;

export default LogoManager;
