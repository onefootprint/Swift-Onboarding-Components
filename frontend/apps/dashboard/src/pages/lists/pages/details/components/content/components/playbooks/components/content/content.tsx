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
    <>
      {list.playbooks?.map(playbook => (
        <Stack gap={3} direction="column" key={playbook.id} marginTop={2}>
          <Stack gap={3} direction="row">
            <Text variant="label-2">{playbook.name}</Text>
            <Text tag="span" variant="label-2">
              •
            </Text>
            <LinkButton
              onClick={() => handleClickPlaybook(playbook.id)}
              variant="label-2"
            >
              {t('details')}
            </LinkButton>
          </Stack>
          <Stack gap={3} direction="row" alignItems="baseline">
            <Text variant="label-4" color="tertiary" minWidth="44px">
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
    </>
  );
};

export default Content;
