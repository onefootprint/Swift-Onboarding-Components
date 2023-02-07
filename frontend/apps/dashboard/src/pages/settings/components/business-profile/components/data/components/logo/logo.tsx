import { useTranslation } from '@onefootprint/hooks';
import { Organization } from '@onefootprint/types';
import { Avatar, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useUpdateOrgLogo from './hooks/use-update-org-logo';

type LogoProps = {
  organization: Organization;
};

const Logo = ({ organization }: LogoProps) => {
  const { t } = useTranslation('pages.settings.business-profile.logo');
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
      <Avatar
        name={organization.name}
        size="large"
        src={organization.logoUrl}
      />

      <ButtonContainer>
        <Label>
          {t('cta')}
          <StyledInput
            type="file"
            accept="image/svg+xml, image/png, image/jpeg"
            onChange={handleChange}
          />
        </Label>
      </ButtonContainer>
    </LogoContainer>
  );
};

const Label = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.accent};
    cursor: pointer;
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
