import { Drawer, LinkButton, Stack } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import RuleSetResults from '../../rule-set-results';
import useEntityRuleSetResult from '../../rule-set-results/hooks/use-entity-rule-set-result';

type DetailsProps = {
  ruleSetResultId: string;
};

const Details = ({ ruleSetResultId }: DetailsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.step-up-event.details',
  });
  const entityId = useEntityId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data, errorMessage, isPending } = useEntityRuleSetResult({
    entityId,
    ruleSetResultId,
  });

  return (
    <>
      <Stack align="center" justify="center" gap={2}>
        <Stack align="center" justify="center" marginLeft={1} marginRight={1}>
          ·
        </Stack>
        <LinkButton
          onClick={() => {
            setDrawerOpen(true);
          }}
        >
          {t('view-details')}
        </LinkButton>
      </Stack>
      <Drawer
        open={isDrawerOpen}
        title={t('title')}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <RuleSetResults data={data} errorMessage={errorMessage} isPending={isPending} />
      </Drawer>
    </>
  );
};

export default Details;
