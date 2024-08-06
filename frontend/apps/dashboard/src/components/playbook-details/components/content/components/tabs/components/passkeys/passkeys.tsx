import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';
import { IcoArrowUpRight16, IcoLightBulb16 } from '@onefootprint/icons';
import { type OnboardingConfig } from '@onefootprint/types';
import { Box, Stack, Text, Toggle, createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type PasskeysProps = {
  playbook: OnboardingConfig;
};

const Passkeys = ({ playbook }: PasskeysProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.passkeys' });
  const [localState, setLocalState] = useState(playbook.promptForPasskey);
  const mutation = useUpdatePlaybook();

  const handleToggle = () => {
    const nextState = !localState;
    setLocalState(nextState);

    mutation.mutate(
      {
        id: playbook.id,
        promptForPasskey: nextState,
      },
      {
        onError: () => {
          setLocalState(!localState);
        },
      },
    );
  };

  return (
    <Stack gap={8} flexDirection="column">
      <Stack gap={5} flexDirection="column">
        <Text variant="label-3">{t('title')}</Text>
        <Stack>
          <Toggle
            label={t('form.enable.label')}
            hint={t('form.enable.hint')}
            checked={localState}
            onChange={handleToggle}
          />
        </Stack>
      </Stack>
      <Stack padding={5} gap={5} backgroundColor="secondary" flexDirection="column" borderRadius="default">
        <Stack gap={2}>
          <Box position="relative" top="2px">
            <IcoLightBulb16 />
          </Box>
          <Text variant="label-3" gap={2}>
            {t('about.title')}
          </Text>
        </Stack>
        <Stack flexDirection="column" gap={3}>
          <StyledLink href="https://developer.apple.com/passkeys/" target="_blank">
            {t('about.ios')}
            <IcoArrowUpRight16 />
          </StyledLink>
          <StyledLink href="https://developer.android.com/design/ui/mobile/guides/patterns/passkeys" target="_blank">
            {t('about.android')}
            <IcoArrowUpRight16 />
          </StyledLink>
        </Stack>
      </Stack>
    </Stack>
  );
};

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    align-items: center;
    color: ${theme.color.accent};
    display: flex;
    gap: ${theme.spacing[2]};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    svg path {
      fill: ${theme.color.accent};
    }
  `}

`;

export default Passkeys;
