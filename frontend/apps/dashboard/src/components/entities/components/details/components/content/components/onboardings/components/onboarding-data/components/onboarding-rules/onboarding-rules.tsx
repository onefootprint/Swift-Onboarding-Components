import useEntityId from '@/entities/components/details/hooks/use-entity-id';
import { getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import Loading from '../../../loading';
import groupRuleResults from '../../utils/group-rule-results';
import Subsection from '../subsection';
import Content from './components/content';
import RulesDropdown from './components/rules-dropdown';

type OnboardingRulesProps = {
  ruleSetResultId: string;
};

const OnboardingRules = ({ ruleSetResultId }: OnboardingRulesProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.rules' });
  const entityId = useEntityId();
  const { data, isPending, error } = useQuery({
    ...getEntitiesByFpIdRuleSetResultByRuleSetResultIdOptions({
      path: { fpId: entityId, ruleSetResultId },
    }),
    enabled: Boolean(entityId) && Boolean(ruleSetResultId),
  });
  const [showTriggeredRules, setShowTriggeredRules] = useState(true);

  const handleClick = (isTriggered: boolean) => {
    setShowTriggeredRules(isTriggered);
  };

  return (
    <Subsection title={t('title')} hasDivider rightComponent={<RulesDropdown onClick={handleClick} />}>
      {isPending && <Loading />}
      {error && <ErrorComponent error={error} />}
      {data && data.ruleResults.length > 0 && (
        <Content
          ruleResults={groupRuleResults(data.ruleResults)[showTriggeredRules ? 'triggered' : 'notTriggered']}
          showTriggered={showTriggeredRules}
        />
      )}
      {data?.ruleResults.length === 0 && <ErrorComponent error={t('no-rule-results')} />}
    </Subsection>
  );
};

export default OnboardingRules;
