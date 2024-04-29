import type { ListDetails } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
      pathname: '/playbooks',
      query: { ob_config_id: playbookId },
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
            <Stack gap={3} direction="row" flexWrap="wrap" align="center">
              <Text variant="body-4" color="primary">
                {t('if')}
              </Text>
              {playbook.rules.map(rule => (
                <Stack gap={3} direction="row" key={rule.ruleId}>
                  {rule.ruleExpression.map((expression, index) => (
                    <>
                      {/* TODO: replace with Claudio's new component */}
                      <Text key={JSON.stringify(expression)} variant="body-3">
                        {expression.field}
                      </Text>
                      <Text key={JSON.stringify(expression)} variant="body-3">
                        {expression.op}
                      </Text>
                      <Text key={JSON.stringify(expression)} variant="body-3">
                        {expression.value}
                      </Text>
                      {index < rule.ruleExpression.length - 1 && (
                        <Text variant="body-3">{t('and')}</Text>
                      )}
                    </>
                  ))}
                </Stack>
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
