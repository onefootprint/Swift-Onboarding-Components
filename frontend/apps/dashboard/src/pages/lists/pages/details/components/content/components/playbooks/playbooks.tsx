import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from 'src/components';

import useListDetails from '../../../../hooks/use-list-details';
import SectionTitle from '../section-title';

const Playbooks = () => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.playbooks',
  });
  const router = useRouter();
  const id = router.query.id as string;
  const { isLoading, error, data } = useListDetails(id);

  if (error) {
    return <Error error={error} />;
  }

  if (isLoading || !data) {
    return null;
  }

  const handleClickPlaybook = (playbookId: string) => {
    router.push({
      pathname: '/playbooks',
      query: { ob_config_id: playbookId },
    });
  };

  return (
    <Stack gap={4} direction="column">
      <SectionTitle title={t('title', { alias: data.alias })} />
      {data.playbooks?.map(playbook => (
        <Stack gap={3} direction="row" key={playbook.id}>
          <Stack gap={2} direction="column">
            <Text variant="label-2">{playbook.name}</Text>
            <Text tag="span" variant="label-2">
              •
            </Text>
            <LinkButton onClick={() => handleClickPlaybook(playbook.id)}>
              {t('details')}
            </LinkButton>
          </Stack>
          <Stack gap={2} direction="column" flexWrap="wrap">
            {playbook.rules.map(rule => (
              <Stack gap={1} direction="row" key={rule.ruleId}>
                {/* TODO: replace with Claudio's new component */}
                {rule.ruleExpression.map((expression, index) => (
                  <>
                    <Text
                      key={`${expression.field}-${expression.op}-${expression.value}`}
                      variant="body-3"
                    >
                      {expression.field}
                    </Text>
                    <Text
                      key={`${expression.field}-${expression.op}-${expression.value}`}
                      variant="body-3"
                    >
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
      ))}
      {!data.playbooks?.length && (
        <Text variant="body-3" color="tertiary">
          {t('empty')}
        </Text>
      )}
    </Stack>
  );
};

export default Playbooks;
