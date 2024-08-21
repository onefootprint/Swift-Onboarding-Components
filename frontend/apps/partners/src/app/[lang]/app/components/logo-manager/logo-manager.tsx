import { Avatar, Stack, createFontStyles, useToast } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getErrorMessage } from '@/helpers';
import type { PartnerOrganization } from '@/queries';
import { putPartnerLogo } from '@/queries';

type LogoManagerProps = { organization: PartnerOrganization };

const LogoManager = ({ organization }: LogoManagerProps) => {
  const { t } = useTranslation('common');
  const toast = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) return;
    const formData = new FormData();
    formData.set('file', files[0]);

    putPartnerLogo(formData).catch(err => {
      toast.show({
        title: 'Upload failed',
        variant: 'error',
        description: getErrorMessage(err),
      });
    });
  };

  return (
    <Stack gap={5}>
      <Avatar name={organization.name} size="large" src={organization.logoUrl} />

      <Stack alignItems="center" justifyContent="center">
        <CtaLabel>
          {t('change-logo')}
          <InvisibleInput type="file" accept="image/svg+xml, image/png, image/jpeg" onChange={handleChange} />
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

    ${
      disabled &&
      css`
      pointer-events: none;
      opacity: 0.5;
    `
    }
  `}
`;

const InvisibleInput = styled.input`
  display: none;
`;

export default LogoManager;
