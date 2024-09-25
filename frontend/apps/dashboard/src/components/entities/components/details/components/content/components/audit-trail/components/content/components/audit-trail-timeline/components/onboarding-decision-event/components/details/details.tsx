import { Drawer, LinkButton, Stack, Tabs } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

import type { OnboardingDecisionEventData } from '@onefootprint/types';
import RuleSetResults from '../../../rule-set-results';
import useEntityRuleSetResult from '../../../rule-set-results/hooks/use-entity-rule-set-result';
import FieldValidations from './components/field-validations';

type DetailsProps = {
  onboardingDecision: OnboardingDecisionEventData;
  ruleSetResultId?: string;
};

const Details = ({ onboardingDecision, ruleSetResultId }: DetailsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.onboarding-decision-event.not-verified-details',
  });
  const { isLive } = useSession();
  const entityId = useEntityId();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const options = [
    { value: 'rules', label: t('drawer.tabs.rules') },
    { value: 'field-validations', label: t('drawer.tabs.field-validations') },
  ];
  const [tab, setTab] = useState(options[0].value);
  const { data, errorMessage, isPending } = useEntityRuleSetResult({
    entityId,
    ruleSetResultId,
  });
  const showRulesTab = (isLive || onboardingDecision.decision.ranRulesInSandbox) && data && data.actionTriggered;

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
            {tab === 'rules' && <RuleSetResults data={data} errorMessage={errorMessage} isPending={isPending} />}
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
