import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, CodeInline, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css, useTheme } from 'styled-components';

const Create = lazy(() => import('src/components/playbooks/create-playbook'));

export type HeaderProps = {
  playbook: OnboardingConfiguration;
  isDisabled: boolean;
};

const Header = ({ playbook, isDisabled }: HeaderProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'header' });
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <>
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
          <PermissionGate
            scopeKind={RoleScopeKind.onboardingConfiguration}
            fallbackText={t('edit.cta-not-allowed')}
            tooltipPosition="left"
          >
            <Button variant="secondary" onClick={() => setIsOpen(true)}>
              {t('edit.cta')}
            </Button>
          </PermissionGate>
        </Stack>
      </HeaderContainer>
      <Suspense>
        <Create open={isOpen} onClose={() => setIsOpen(false)} onDone={() => setIsOpen(false)} playbook={playbook} />
      </Suspense>
    </>
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
