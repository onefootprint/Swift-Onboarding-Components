import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { LinkButton, Stack, Text, Toggle } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type PasskeysProps = {
  playbook: OnboardingConfiguration;
};

type LocalState = {
  promptForPasskey: boolean;
  skipConfirm: boolean;
};

const Settings = ({ playbook }: PasskeysProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'settings' });
  const [localState, setLocalState] = useState<LocalState>({
    promptForPasskey: playbook.promptForPasskey,
    skipConfirm: Boolean(playbook.skipConfirm),
  });
  const mutation = useUpdatePlaybook();

  const handleToggle = (property: keyof LocalState) => () => {
    const nextState = !localState[property];
    setLocalState({
      ...localState,
      [property]: nextState,
    });

    mutation.mutate(
      {
        id: playbook.id,
        [property]: nextState,
      },
      {
        onError: () => {
          setLocalState({
            ...localState,
            [property]: !nextState,
          });
        },
      },
    );
  };

  return (
    <Stack gap={8} flexDirection="column">
      <Stack direction="column">
        <Toggle
          label={t('passkeys.form.enable.label')}
          checked={localState.promptForPasskey}
          onChange={handleToggle('promptForPasskey')}
        />
        <DescriptionContainer direction="column">
          <Text variant="body-2" color="tertiary" gap={2}>
            {t('passkeys.form.enable.hint')}
          </Text>
          <Stack direction="row" gap={3}>
            <Text variant="body-2" color="tertiary" gap={2}>
              {t('passkeys.about.title')}
            </Text>
            <LinkButton
              href="https://developer.apple.com/passkeys/"
              target="_blank"
              variant="label-2"
              iconComponent={IcoArrowUpRight16}
            >
              {t('passkeys.about.ios')}
            </LinkButton>
            <LinkButton
              href="https://developer.android.com/design/ui/mobile/guides/patterns/passkeys"
              target="_blank"
              variant="label-2"
              iconComponent={IcoArrowUpRight16}
            >
              {t('passkeys.about.android')}
            </LinkButton>
          </Stack>
        </DescriptionContainer>
      </Stack>
      {(playbook.kind === 'kyb' || playbook.kind === 'kyc') && (
        <Stack direction="column">
          <Toggle
            label={t('skip-confirm.title')}
            checked={localState.skipConfirm}
            onChange={handleToggle('skipConfirm')}
          />
          <DescriptionContainer>
            <Text variant="body-2" color="tertiary">
              {t('skip-confirm.description')}
            </Text>
          </DescriptionContainer>
        </Stack>
      )}
    </Stack>
  );
};

const DescriptionContainer = styled(Stack)`
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[9]} + ${theme.spacing[3]});
  `}
`;

export default Settings;
