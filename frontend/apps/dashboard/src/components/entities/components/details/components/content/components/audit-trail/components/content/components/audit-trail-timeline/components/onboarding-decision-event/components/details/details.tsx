import { Drawer, LinkButton, Stack, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

import RuleSetResults from '../../../rule-set-results';
import useEntityRuleSetResult from '../../../rule-set-results/hooks/use-entity-rule-set-result';
import FieldValidations from './components/field-validations';

type DetailsProps = {
  ruleSetResultId?: string;
};

const Details = ({ ruleSetResultId }: DetailsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details',
  });
  const { isLive } = useSession();
  const entityId = useEntityId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const options = [
    { value: 'rules', label: t('drawer.tabs.rules') },
    { value: 'field-validations', label: t('drawer.tabs.field-validations') },
  ];
  const [tab, setTab] = useState(options[0].value);
  const { data, errorMessage, isLoading } = useEntityRuleSetResult({
    entityId,
    ruleSetResultId,
  });
  const showRulesTab = isLive && data && data.actionTriggered;

  const handleChange = (value: string) => {
    setTab(value);
  };

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
        title={t(showRulesTab ? 'drawer.details-title' : 'drawer.field-title')}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        {showRulesTab ? (
          <Stack direction="column" gap={7}>
            <Tabs options={options} onChange={handleChange} />
            {tab === 'rules' && <RuleSetResults data={data} errorMessage={errorMessage} isLoading={isLoading} />}
            {tab === 'field-validations' && <FieldValidations entityId={entityId} />}
          </Stack>
        ) : (
          <FieldValidations entityId={entityId} />
        )}
      </Drawer>
    </>
  );
};

export default Details;
