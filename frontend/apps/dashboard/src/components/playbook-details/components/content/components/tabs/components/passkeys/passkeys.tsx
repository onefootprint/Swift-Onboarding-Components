import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';
import { IcoArrowUpRight16, IcoLightBulb16 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { Box, LinkButton, Stack, Text, Toggle } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
          <LinkButton href="https://developer.apple.com/passkeys/" target="_blank" iconComponent={IcoArrowUpRight16}>
            {t('about.ios')}
          </LinkButton>
          <LinkButton
            href="https://developer.android.com/design/ui/mobile/guides/patterns/passkeys"
            target="_blank"
            iconComponent={IcoArrowUpRight16}
          >
            {t('about.android')}
          </LinkButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Passkeys;
