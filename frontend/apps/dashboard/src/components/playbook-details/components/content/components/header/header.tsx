import type { OnboardingConfig } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, CodeInline, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css, useTheme } from 'styled-components';

import EditNameDialog from './components/edit-name-dialog';

export type HeaderProps = {
  playbook: OnboardingConfig;
  isDisabled: boolean;
};

const Header = ({ playbook, isDisabled }: HeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.header',
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const theme = useTheme();

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <HeaderContainer data-is-disabled={isDisabled}>
      <Text variant="label-1">{playbook.name}</Text>
      <Stack align="center" flexWrap="wrap" justify="space-between" gap={3} width="100%" minHeight={theme.spacing[8]}>
        <Stack align="center" justify="center" gap={3}>
          <Text variant="body-3">{t(`type.${playbook.kind}` as ParseKeys<'common'>)}</Text>
          <span>·</span>
          <CodeInline truncate isPrivate>
            {playbook.key}
          </CodeInline>
        </Stack>
        {!isFormOpen && (
          <PermissionGate
            scopeKind={RoleScopeKind.onboardingConfiguration}
            fallbackText={t('edit-name.cta-not-allowed')}
            tooltipPosition="left"
          >
            <Button variant="secondary" onClick={handleOpenForm}>
              {t('edit-name.cta')}
            </Button>
          </PermissionGate>
        )}
      </Stack>
      <EditNameDialog open={isFormOpen} onClose={handleCloseForm} playbook={playbook} />
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};

    &[data-is-disabled='true'] {
      opacity: 0.5;
      pointer-events: none;
      user-select: none;
    }
  `}
`;

export default Header;
