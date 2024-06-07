import type { ListDetails } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Rule from './components/rule';

type ContentProps = {
  list: ListDetails;
};

const Content = ({ list }: ContentProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.playbooks',
  });
  const router = useRouter();

  const handleClickPlaybook = (playbookId: string) => {
    router.push({
      pathname: `/playbooks/${playbookId}`,
    });
  };

  return (
    <Stack direction="column" gap={7} marginTop={3}>
      {list.playbooks?.map(playbook => (
        <Stack gap={4} direction="column" key={playbook.id}>
          <Stack gap={3} direction="row">
            <Text variant="label-3">{playbook.name}</Text>
            <Text tag="span" variant="label-2">
              •
            </Text>
            <LinkButton onClick={() => handleClickPlaybook(playbook.id)} variant="label-3">
              {t('details')}
            </LinkButton>
          </Stack>
          <Stack gap={3} direction="row" alignItems="baseline" paddingLeft={5}>
            <Text variant="label-3" color="tertiary" minWidth="44px">
              {t('in-rule')}
            </Text>
            <Stack gap={3} direction="column">
              {playbook.rules.map(rule => (
                <Rule key={rule.ruleId} rule={rule} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      ))}
      {!list.playbooks?.length && (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
    </Stack>
  );
};

export default Content;
